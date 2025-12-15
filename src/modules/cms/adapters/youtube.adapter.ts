import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IContentAdapter, UnifiedContentData } from './interface/content-interface';

@Injectable()
export class YouTubeAdapter implements IContentAdapter {
  private readonly logger = new Logger(YouTubeAdapter.name);
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('YOUTUBE_API_KEY') || '';
  }

  async fetchContent(config?: Record<string, unknown>): Promise<UnifiedContentData[]> {
    if (!this.apiKey) {
      this.logger.warn('YouTube API key is missing');
      return [];
    }

    const url = typeof config?.url === 'string' ? config.url : undefined;
    const playlistId = await this.resolvePlaylistId(url);
    if (!playlistId) return [];

    const videoIds = await this.fetchAllVideoIds(playlistId);
    return this.fetchVideoDetails(videoIds);
  }

  private async resolvePlaylistId(url?: string): Promise<string | null> {
    if (!url) {
      const channelId = this.configService.get<string>('YOUTUBE_CHANNEL_ID');
      return channelId ? this.getUploadsPlaylistId(channelId) : null;
    }

    const playlistMatch = url.match(/[?&]list=([^#&?]+)/);
    if (playlistMatch) return playlistMatch[1];

    const channelMatch =
      url.match(/channel\/(UC[\w-]{21}[AQgw])/) || (url.startsWith('UC') && url.length === 24 ? [null, url] : null);
    if (channelMatch) return this.getUploadsPlaylistId(channelMatch[1]!);

    return null;
  }

  private async getUploadsPlaylistId(channelId: string): Promise<string | null> {
    try {
      const { data } = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: { part: 'contentDetails', id: channelId, key: this.apiKey },
      });
      return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || null;
    } catch (error) {
      this.logger.error(`Failed to resolve channel: ${error.message}`);
      return null;
    }
  }

  private async fetchAllVideoIds(playlistId: string): Promise<string[]> {
    const videoIds: string[] = [];
    let pageToken: string | undefined;

    do {
      try {
        const { data } = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
          params: {
            part: 'snippet',
            playlistId,
            maxResults: 50,
            pageToken,
            key: this.apiKey,
          },
        });

        if (data.items) {
          videoIds.push(...data.items.map((item: any) => item.snippet.resourceId.videoId));
        }
        pageToken = data.nextPageToken;
      } catch (error) {
        this.logger.error(`Failed to fetch playlist items: ${error.message}`);
        break;
      }
    } while (pageToken);

    return videoIds;
  }

  private async fetchVideoDetails(videoIds: string[]): Promise<UnifiedContentData[]> {
    const results: UnifiedContentData[] = [];

    for (let i = 0; i < videoIds.length; i += 50) {
      const chunk = videoIds.slice(i, i + 50);
      try {
        const { data } = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,contentDetails',
            id: chunk.join(','),
            key: this.apiKey,
          },
        });

        if (data.items) {
          results.push(
            ...data.items.map((item: any) => ({
              title: item.snippet.title,
              description: item.snippet.description,
              videoUrl: `https://youtube.com/watch?v=${item.id}`,
              duration: this.parseDuration(item.contentDetails.duration),
              source: 'YouTube',
              publishedAt: new Date(item.snippet.publishedAt),
              externalId: item.id,
            })),
          );
        }
      } catch (error) {
        this.logger.error(`Failed to fetch video details: ${error.message}`);
      }
    }
    return results;
  }

  private parseDuration(isoDuration: string): number {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
  }
}
