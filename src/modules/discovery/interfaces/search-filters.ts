export interface SearchFilters {
  category?: string;
  language?: string;
  source?: string;
  description?: string;
}

export interface EpisodeSearchFilters {
  title?: string;
  description?: string;
  episodeNumber?: number;
  publishDateFrom?: Date;
}
