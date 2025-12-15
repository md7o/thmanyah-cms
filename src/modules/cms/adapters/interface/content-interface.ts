// Adapter For Content Module
export interface UnifiedContentData {
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  source: string;
  publishedAt?: Date;
  externalId: string;
}

// Content Adapter Interface
export interface IContentAdapter {
  fetchContent(config?: Record<string, unknown>): Promise<UnifiedContentData[]>;
}
