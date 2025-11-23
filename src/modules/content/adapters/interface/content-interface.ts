// Adapter For Content Module

export interface UnifiedProgramData {
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  source: string;
}

// Content Adapter Interface
export interface IContentAdapter {
  fetchContent(): Promise<UnifiedProgramData[]>;
}
