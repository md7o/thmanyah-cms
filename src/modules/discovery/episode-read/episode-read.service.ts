import { Injectable } from '@nestjs/common';
import { EpisodeService as CmsEpisodeService } from '../../cms/episode/episode.service';
import { SearchService } from '../search/search.service';
import { GetEpisodeReadDto } from './dto/get-episode-read.dto';

@Injectable()
export class EpisodeReadService {
  constructor(
    private readonly cmsEpisodeService: CmsEpisodeService,
    private readonly searchService: SearchService,
  ) {}

  async findAll(query: GetEpisodeReadDto) {
    const { page, limit, ...filters } = query;
    return this.searchService.searchEpisodes(undefined, filters, page, limit);
  }

  async findOne(id: number) {
    return this.cmsEpisodeService.findOne(id);
  }
}
