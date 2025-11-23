// yourube adapter for YouTube videos
import {
  IContentAdapter,
  UnifiedProgramData,
} from './interface/content-interface';

export class YouTubeAdapter implements IContentAdapter {
  async fetchContent(): Promise<UnifiedProgramData[]> {
    // YouTube API call Simulation
    const rawYoutubeData = [
      {
        id: 'xy123',
        snippet: { title: 'بودكاست فنجان', desc: 'حلقة رائعة' },
        contentDetails: { duration: '240' },
        player: { embedHtml: '...' },
      },
    ];

    // Translate process
    const cleanData: UnifiedProgramData[] = rawYoutubeData.map((item) => ({
      title: item.snippet.title,
      description: item.snippet.desc,
      videoUrl: `https://youtube.com/watch?v=${item.id}`,
      duration: parseInt(item.contentDetails.duration),
      source: 'YouTube',
    }));

    return cleanData;
  }
}
