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
    return playlistId ? this.fetchVideos(playlistId) : [];
  }

  private async resolvePlaylistId(url?: string): Promise<string | null> {
    if (!url) {
      const id = this.configService.get<string>('YOUTUBE_CHANNEL_ID');
      return id ? this.getUploadsPlaylistId(id) : null;
    }

    const list = url.match(/[?&]list=([^#&?]+)/)?.[1];
    if (list) return list;

    const channel =
      url.match(/channel\/(UC[\w-]{21}[AQgw])/) || (url.startsWith('UC') && url.length === 24 ? [null, url] : null);
    return channel ? this.getUploadsPlaylistId(channel[1]!) : null;
  }

  private async getUploadsPlaylistId(id: string): Promise<string | null> {
    try {
      const { data } = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: { part: 'contentDetails', id, key: this.apiKey },
      });
      return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || null;
    } catch (e) {
      this.logger.error(`Failed to resolve channel: ${e.message}`);
      return null;
    }
  }

  private async fetchVideos(playlistId: string): Promise<UnifiedContentData[]> {
    const results: UnifiedContentData[] = [];
    let pageToken: string | undefined;

    do {
      try {
        const { data: pl } = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
          params: { part: 'snippet', playlistId, maxResults: 50, pageToken, key: this.apiKey },
        });

        if (!pl.items?.length) break;
        const ids = pl.items.map((i: any) => i.snippet.resourceId.videoId).join(',');

        const { data: v } = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: { part: 'snippet,contentDetails', id: ids, key: this.apiKey },
        });

        if (v.items) {
          results.push(
            ...v.items.map((i: any) => ({
              title: i.snippet.title,
              description: i.snippet.description,
              videoUrl: `https://youtube.com/watch?v=${i.id}`,
              duration: this.parseDuration(i.contentDetails.duration),
              source: 'YouTube',
              publishedAt: new Date(i.snippet.publishedAt),
              externalId: i.id,
            })),
          );
        }
        pageToken = pl.nextPageToken;
      } catch (e) {
        this.logger.error(`Failed to fetch videos: ${e.message}`);
        break;
      }
    } while (pageToken);

    return results;
  }

  private parseDuration(d: string): number {
    const m = d.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    return m ? parseInt(m[1] || '0') * 3600 + parseInt(m[2] || '0') * 60 + parseInt(m[3] || '0') : 0;
  }
}
