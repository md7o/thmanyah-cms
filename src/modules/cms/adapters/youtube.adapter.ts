import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IContentAdapter, UnifiedContentData } from './interface/content-interface';

interface YouTubeChannelResponse {
  items?: Array<{
    contentDetails: {
      relatedPlaylists: {
        uploads: string;
      };
    };
  }>;
}

interface YouTubePlaylistItem {
  snippet: {
    resourceId: {
      videoId: string;
    };
  };
}

interface YouTubePlaylistResponse {
  items?: YouTubePlaylistItem[];
}

interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
  };
  contentDetails: {
    duration: string;
  };
}

interface YouTubeVideoResponse {
  items?: YouTubeVideoItem[];
}

function convertDurationToSeconds(isoDuration: string): number {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

@Injectable()
export class YouTubeAdapter implements IContentAdapter {
  private readonly logger = new Logger(YouTubeAdapter.name);
  private readonly apiKey: string | undefined;
  private readonly defaultChannelId: string | undefined;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('YOUTUBE_API_KEY');
    this.defaultChannelId = this.configService.get<string>('YOUTUBE_CHANNEL_ID');
  }

  async fetchContent(config?: Record<string, unknown>): Promise<UnifiedContentData[]> {
    if (!this.apiKey) {
      this.logger.warn('YouTube API key is not set.');
      return [];
    }

    let targetPlaylistId: string | null = null;

    // Try to extract Playlist ID from URL
    if (config?.url && typeof config.url === 'string') {
      targetPlaylistId = this.extractPlaylistId(config.url);
    }

    // If no playlist ID, fallback to Channel Uploads
    if (!targetPlaylistId) {
      let channelId = this.defaultChannelId;

      if (config?.url && typeof config.url === 'string') {
        const extractedId = this.extractChannelId(config.url);
        if (extractedId) {
          channelId = extractedId;
        }
      }

      if (!channelId) {
        this.logger.error('No Channel ID or Playlist ID found in config or environment.');
        return [];
      }

      try {
        const channelResponse = await axios.get<YouTubeChannelResponse>(
          `https://www.googleapis.com/youtube/v3/channels`,
          {
            params: {
              part: 'contentDetails',
              id: channelId,
              key: this.apiKey,
            },
          },
        );

        const items = channelResponse.data.items;
        if (!items || items.length === 0) {
          this.logger.error(`Channel not found: ${channelId}`);
          return [];
        }

        targetPlaylistId = items[0].contentDetails.relatedPlaylists.uploads;
      } catch (error) {
        this.logger.error('Error fetching channel details', error instanceof Error ? error.message : String(error));
        return [];
      }
    }

    if (!targetPlaylistId) {
      return [];
    }

    try {
      // Get Videos from Playlist
      const playlistResponse = await axios.get<YouTubePlaylistResponse>(
        `https://www.googleapis.com/youtube/v3/playlistItems`,
        {
          params: {
            part: 'snippet',
            playlistId: targetPlaylistId,
            maxResults: 50,
            key: this.apiKey,
          },
        },
      );

      const playlistItems = playlistResponse.data.items;
      if (!playlistItems || playlistItems.length === 0) {
        return [];
      }

      const videoIds = playlistItems.map((item) => item.snippet.resourceId.videoId).join(',');

      // 4. Get Video Details (for duration)
      const videosResponse = await axios.get<YouTubeVideoResponse>(`https://www.googleapis.com/youtube/v3/videos`, {
        params: {
          part: 'contentDetails,snippet',
          id: videoIds,
          key: this.apiKey,
        },
      });

      const videos = videosResponse.data.items || [];

      const cleanData: UnifiedContentData[] = videos
        .filter((item) => item.id)
        .map((item) => ({
          title: item.snippet.title,
          description: item.snippet.description,
          videoUrl: `https://youtube.com/watch?v=${item.id}`,
          duration: convertDurationToSeconds(item.contentDetails.duration),
          source: 'YouTube',
          publishedAt: new Date(item.snippet.publishedAt),
          externalId: item.id,
        }));

      return cleanData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Error fetching YouTube content', errorMessage);
      if (axios.isAxiosError(error)) {
        this.logger.error(error.response?.data);
      }
      throw error;
    }
  }

  private extractPlaylistId(url: string): string | null {
    const match = url.match(/[?&]list=([^#&?]+)/);
    return match ? match[1] : null;
  }

  private extractChannelId(url: string): string | null {
    // Simple regex for channel ID
    const channelIdMatch = url.match(/channel\/(UC[\w-]{21}[AQgw])/);
    if (channelIdMatch) return channelIdMatch[1];

    if (url.startsWith('UC') && url.length === 24) return url;

    return null;
  }
}
