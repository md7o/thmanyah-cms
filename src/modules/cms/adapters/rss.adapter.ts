import { Injectable } from '@nestjs/common';
import { IContentAdapter, UnifiedContentData } from './interface/content-interface';

@Injectable()
export class RSSAdapter implements IContentAdapter {
  async fetchContent(): Promise<UnifiedContentData[]> {
    // XML Simulator
    const rawRssItems = [
      {
        item_title: 'صوتيات وثائقية',
        summary: 'ملف صوتي عن...',
        enclosure: { url: 'https://audio.mp3', length: '3600' },
      },
    ];

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
