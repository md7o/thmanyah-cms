// xml adapter for RSS feeds
import {
  IContentAdapter,
  UnifiedContentData,
} from './interface/content-interface';

export class RSSAdapter implements IContentAdapter {
  async fetchContent(
    config?: Record<string, any>,
  ): Promise<UnifiedContentData[]> {
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
      externalId: item.enclosure.url,
    }));
  }
}
