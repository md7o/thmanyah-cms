import { Injectable, Inject } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Program } from '../../cms/program/entities/program.entity';
import { Episode } from '../../cms/episode/entities/episode.entity';

interface SearchFilters {
  category?: string;
  language?: string;
  source?: string;
  description?: string;
}

interface EpisodeSearchFilters {
  title?: string;
  description?: string;
  episodeNumber?: number;
  publishDateFrom?: Date;
}

@Injectable()
export class SearchService {
  constructor(
    private readonly esSearch: ElasticsearchService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Generates a unique cache key.
  private getCacheKey(prefix: string, ...args: any[]): string {
    return `${prefix}:${args.map((arg) => JSON.stringify(arg)).join(':')}`;
  }

  // Indexes a program in Elasticsearch.
  async indexProgram(program: Program) {
    return this.esSearch.index({
      index: 'programs',
      id: program.id,
      document: {
        title: program.title,
        description: program.description,
        category: program.category,
        language: program.language,
        source: program.source,
        createdAt: program.createdAt,
      },
    });
  }

  // Indexes an episode in Elasticsearch.
  async indexEpisode(episode: Episode) {
    return this.esSearch.index({
      index: 'episodes',
      id: episode.id.toString(),
      document: {
        title: episode.title,
        description: episode.description,
        programId: episode.programId,
        duration: episode.duration,
        publishDate: episode.publishDate,
        episodeNumber: episode.episodeNumber,
      },
    });
  }

  // Searches programs with text and filters.
  async search(text?: string, filters?: SearchFilters, page: number = 1, limit: number = 12) {
    const cacheKey = this.getCacheKey('search:programs', text, filters, page, limit);
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const conditions: Record<string, unknown>[] = [];

    if (text) {
      conditions.push({
        multi_match: {
          query: text,
          fields: ['title', 'description', 'category'],
        },
      });
    }

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          conditions.push({ match: { [key]: value } });
        }
      });
    }

    const result = await this.esSearch.search({
      index: 'programs',
      from: (page - 1) * limit,
      size: limit,
      query: {
        bool: {
          must: conditions.length > 0 ? conditions : [{ match_all: {} }],
        },
      },
    });

    const hits = result.hits.hits.map((hit) => hit._source);
    await this.cacheManager.set(cacheKey, hits);
    return hits;
  }

  // Searches episodes with text and filters.
  async searchEpisodes(
    text: string | undefined,
    filters: EpisodeSearchFilters = {},
    page: number = 1,
    limit: number = 12,
  ) {
    const cacheKey = this.getCacheKey('search:episodes', text, filters, page, limit);
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const conditions: Record<string, unknown>[] = [];

    // Text represent string values
    if (text) {
      conditions.push({
        multi_match: {
          query: text,
          fields: ['title', 'description'],
        },
      });
    }

    const createFuzzyMatch = (field: string, value: string) => ({
      match: {
        [field]: {
          query: value,
          operator: 'and',
          fuzziness: 'AUTO',
        },
      },
    });

    const strategies: Record<keyof EpisodeSearchFilters, (val: any) => any> = {
      title: (val) => createFuzzyMatch('title', val),
      description: (val) => createFuzzyMatch('description', val),
      episodeNumber: (val) => ({ term: { episodeNumber: val } }),
      publishDateFrom: (val) => ({ range: { publishDate: { gte: val } } }),
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && strategies[key as keyof EpisodeSearchFilters]) {
        conditions.push(strategies[key as keyof EpisodeSearchFilters](value));
      }
    });

    const result = await this.esSearch.search({
      index: 'episodes',
      from: (page - 1) * limit,
      size: limit,
      query: {
        bool: {
          must: conditions.length > 0 ? conditions : [{ match_all: {} }],
        },
      },
    });

    const hits = result.hits.hits.map((hit) => hit._source);
    await this.cacheManager.set(cacheKey, hits);
    return hits;
  }

  // Updates a program in Elasticsearch.
  async update(program: Program) {
    const data: Record<string, unknown> = {
      title: program.title,
      description: program.description,
      category: program.category,
      language: program.language,
      source: program.source,
      createdAt: program.createdAt,
    };

    const script = Object.entries(data)
      .map(([key]) => `ctx._source.${key}=params.${key};`)
      .join(' ');

    return this.esSearch.update({
      index: 'programs',
      id: program.id,
      script: {
        source: script,
        params: data,
      },
    });
  }

  // Removes a program from Elasticsearch.
  async remove(id: string) {
    await this.esSearch.delete({
      index: 'programs',
      id: id,
    });
  }

  // Removes an episode from Elasticsearch.
  async removeEpisode(id: string) {
    await this.esSearch.delete({
      index: 'episodes',
      id: id,
    });
  }

  // Bulk indexes programs.
  async bulkIndexPrograms(programs: Program[]) {
    const operations = programs.flatMap((program) => [
      { index: { _index: 'programs', _id: program.id } },
      {
        title: program.title,
        description: program.description,
        category: program.category,
        language: program.language,
        source: program.source,
        createdAt: program.createdAt,
      },
    ]);

    if (operations.length > 0) {
      await this.esSearch.bulk({ operations });
    }
  }

  // Bulk indexes episodes.
  async bulkIndexEpisodes(episodes: Episode[]) {
    const operations = episodes.flatMap((episode) => [
      { index: { _index: 'episodes', _id: episode.id.toString() } },
      {
        title: episode.title,
        description: episode.description,
        programId: episode.programId,
        duration: episode.duration,
        publishDate: episode.publishDate,
        episodeNumber: episode.episodeNumber,
      },
    ]);

    if (operations.length > 0) {
      await this.esSearch.bulk({ operations });
    }
  }
}
