import { Injectable } from '@nestjs/common';
import { ProgramService as CmsProgramService } from '../../cms/program/program.service';
import { GetContentReadDto } from './dto/get-content-read.dto';
import { SearchService } from '../search/search.service';

@Injectable()
export class ContentReadService {
  constructor(
    private readonly cmsProgramService: CmsProgramService,
    private readonly searchService: SearchService,
  ) {}

  async findAll(query: GetContentReadDto) {
    const { title, page, limit, ...filters } = query;
    return this.searchService.search(title, filters, page, limit);
  }

  async findById(id: string) {
    return this.cmsProgramService.findOne(id);
  }
}
