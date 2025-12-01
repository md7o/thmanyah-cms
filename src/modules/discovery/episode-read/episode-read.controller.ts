import { Controller, Get, Param, ParseIntPipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { EpisodeReadService } from './episode-read.service';
import { GetEpisodeReadDto } from './dto/get-episode-read.dto';

@Controller('episodesRead')
export class EpisodeReadController {
  constructor(private readonly episodeReadService: EpisodeReadService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() query: GetEpisodeReadDto) {
    return this.episodeReadService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.episodeReadService.findOne(id);
  }
}
