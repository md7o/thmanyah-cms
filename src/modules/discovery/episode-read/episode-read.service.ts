import { Injectable } from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { GetEpisodeReadDto } from './dto/get-episode-read.dto';

@Injectable()
export class EpisodeReadService {
  constructor(private readonly searchService: SearchService) {}

  async findAll(query: GetEpisodeReadDto) {
    const { page, limit, ...filters } = query;
    return this.searchService.searchEpisodes(undefined, filters, page, limit);
  }

  async findOne(id: string) {
    return this.searchService.findEpisodeById(id);
  }
}
