// xml adapter for RSS feeds
import { IContentAdapter, UnifiedContentData } from './interface/content-interface';

export class RSSAdapter implements IContentAdapter {
  fetchContent(): Promise<UnifiedContentData[]> {
    // XML Simulator
    const rawRssItems = [
      {
        item_title: 'صوتيات وثائقية',
        summary: 'ملف صوتي عن...',
        enclosure: { url: 'https://audio.mp3', length: '3600' },
      },
    ];

    // Translate process
    return Promise.resolve(
      rawRssItems.map((item) => ({
        title: item.item_title,
        description: item.summary,
        videoUrl: item.enclosure.url,
        duration: parseInt(item.enclosure.length),
        source: 'RSS Feed',
        externalId: item.enclosure.url,
      })),
    );
  }
}
