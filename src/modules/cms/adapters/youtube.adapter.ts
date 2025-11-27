// yourube adapter for YouTube videos
import {
  IContentAdapter,
  UnifiedContentData,
} from './interface/content-interface';

function convertDurationToSeconds(isoDuration: string): number {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

export class YouTubeAdapter implements IContentAdapter {
  async fetchContent(
    config?: Record<string, any>,
  ): Promise<UnifiedContentData[]> {
    // YouTube API call Simulation
    const rawYoutubeResponse = {
      kind: 'youtube#videoListResponse',
      etag: 'YIUPV84z',
      items: [
        {
          kind: 'youtube#video',
          id: 'dasdasd',
          snippet: {
            title: 'كيف تنجح العلاقات؟ مع dasdasd الحزيمي | بودكاست فنجان',
            description: 'في هذه الحلقة من بودكاست فنجان...',
            publishedAt: '2023-01-25T13:00:00Z',
            tags: ['فنجان', 'ياسر الحزيمي'],
          },
          contentDetails: {
            duration: 'PT2H58M00S',
          },
        },
      ],
    };

    // Translate process
    const rawItems = rawYoutubeResponse.items;

    const cleanData: UnifiedContentData[] = rawItems.map((item) => ({
      title: item.snippet.title,
      description: item.snippet.description,
      videoUrl: `https://youtube.com/watch?v=${item.id}`,
      duration: convertDurationToSeconds(item.contentDetails.duration),
      source: 'YouTube',
      publishedAt: new Date(item.snippet.publishedAt),
      externalId: item.id,
    }));

    return cleanData;
  }
}
