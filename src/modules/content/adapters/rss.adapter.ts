// xml adapter for RSS feeds
import {
  IContentAdapter,
  UnifiedProgramData,
} from './interface/content-interface';

export class RSSAdapter implements IContentAdapter {
  async fetchContent(): Promise<UnifiedProgramData[]> {
    // XML Simulator
    const rawRssItems = [
      {
        item_title: 'صوتيات وثائقية',
        summary: 'ملف صوتي عن...',
        enclosure: { url: 'https://audio.mp3', length: '3600' },
      },
    ];

    // Translate process
    return rawRssItems.map((item) => ({
      title: item.item_title,
      description: item.summary,
      videoUrl: item.enclosure.url,
      duration: parseInt(item.enclosure.length),
      source: 'RSS Feed',
    }));
  }
}
