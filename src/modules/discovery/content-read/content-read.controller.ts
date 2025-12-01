import { Controller, Get, Param, Query } from '@nestjs/common';
import { ContentReadService } from './content-read.service';
import { GetContentReadDto } from './dto/get-content-read.dto';

@Controller('contentRead')
export class ContentReadController {
  constructor(private readonly contentReadService: ContentReadService) {}

  @Get()
  async findAll(@Query() query: GetContentReadDto) {
    return this.contentReadService.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.contentReadService.findById(id);
  }
}
