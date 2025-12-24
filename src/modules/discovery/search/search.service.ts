import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Program } from '../../cms/program/entities/program.entity';
import { Episode } from '../../cms/episode/entities/episode.entity';
import type { SearchFilters, EpisodeSearchFilters } from '../interfaces/search-filters';
import { RequestCoalescingService } from '../../../common/services/request-coalescing.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly esSearch: ElasticsearchService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly requestCoalescing: RequestCoalescingService,
  ) {}

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

  async findProgramById(id: string) {
    try {
      const result = await this.esSearch.get({ index: 'programs', id });
      return result._source;
    } catch {
      throw new NotFoundException(`Program with ID ${id} not found in search index`);
    }
  }

  async findEpisodeById(id: string) {
    try {
      const result = await this.esSearch.get({ index: 'episodes', id });
      return result._source;
    } catch {
      throw new NotFoundException(`Episode with ID ${id} not found in search index`);
    }
  }

  async search(text?: string, filters: SearchFilters = {}, page = 1, limit = 12) {
    const cacheKey = `search:programs:${text}:${JSON.stringify(filters)}:${page}:${limit}`;

    return this.requestCoalescing.execute(cacheKey, async () => {
      try {
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
      } catch (error) {
        console.error('Redis cache error:', error);
      }

      const must = [
        ...(text ? [{ multi_match: { query: text, fields: ['title', 'description', 'category'] } }] : []),
        ...Object.entries(filters).map(([key, value]) => ({ match: { [key]: value } })),
      ];

      const { hits } = await this.esSearch.search({
        index: 'programs',
        from: (page - 1) * limit,
        size: limit,
        query: { bool: { must } },
      });

      const result = hits.hits.map((hit) => hit._source);

      try {
        await this.cacheManager.set(cacheKey, result, 600000); // 10 minutes TTL
      } catch (error) {
        console.error('Redis cache set error:', error);
      }

      return result;
    });
  }

  async searchEpisodes(text?: string, filters: EpisodeSearchFilters = {}, page = 1, limit = 12) {
    const cacheKey = `search:episodes:${text}:${JSON.stringify(filters)}:${page}:${limit}`;

    return this.requestCoalescing.execute(cacheKey, async () => {
      try {
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
      } catch (error) {
        console.error('Redis cache error:', error);
      }

      const must: any[] = [];
      if (text) {
        must.push({ multi_match: { query: text, fields: ['title', 'description'] } });
      }
      if (filters.title) {
        must.push({ match: { title: { query: filters.title, operator: 'and', fuzziness: 'AUTO' } } });
      }
      if (filters.description) {
        must.push({ match: { description: { query: filters.description, operator: 'and', fuzziness: 'AUTO' } } });
      }
      if (filters.episodeNumber) {
        must.push({ term: { episodeNumber: filters.episodeNumber } });
      }
      if (filters.publishDateFrom) {
        must.push({ range: { publishDate: { gte: filters.publishDateFrom } } });
      }

      const result = await this.esSearch.search({
        index: 'episodes',
        from: (page - 1) * limit,
        size: limit,
        query: { bool: { must: must.length ? must : [{ match_all: {} }] } },
      });

      const hits = result.hits.hits.map((hit) => hit._source);

      try {
        await this.cacheManager.set(cacheKey, hits, 600000); // 10 minutes TTL
      } catch (error) {
        console.error('Redis cache set error:', error);
      }

      return hits;
    });
  }

  async update(program: Program) {
    return this.indexProgram(program);
  }

  async remove(id: string) {
    await this.esSearch.delete({ index: 'programs', id });
  }

  async removeEpisode(id: string) {
    await this.esSearch.delete({ index: 'episodes', id });
  }

  async bulkIndexPrograms(programs: Program[]) {
    if (!programs.length) return;
    const operations = programs.flatMap((p) => [
      { index: { _index: 'programs', _id: p.id } },
      {
        title: p.title,
        description: p.description,
        category: p.category,
        language: p.language,
        source: p.source,
        createdAt: p.createdAt,
      },
    ]);
    await this.esSearch.bulk({ operations });
  }

  async bulkIndexEpisodes(episodes: Episode[]) {
    if (!episodes.length) return;
    const operations = episodes.flatMap((e) => [
      { index: { _index: 'episodes', _id: e.id.toString() } },
      {
        title: e.title,
        description: e.description,
        programId: e.programId,
        duration: e.duration,
        publishDate: e.publishDate,
        episodeNumber: e.episodeNumber,
      },
    ]);
    await this.esSearch.bulk({ operations });
  }
}
