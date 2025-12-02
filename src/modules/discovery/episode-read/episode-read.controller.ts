import { Controller, Get, Param, ParseIntPipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { EpisodeReadService } from './episode-read.service';
import { GetEpisodeReadDto } from './dto/get-episode-read.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Discovery - Episodes')
@Controller('episodesRead')
export class EpisodeReadController {
  constructor(private readonly episodeReadService: EpisodeReadService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Search episodes',
    description:
      'Search for episodes using filters. You can use query parameters like ?title=فنجان to search by title.',
  })
  @ApiResponse({ status: 200, description: 'Return list of episodes.' })
  async findAll(@Query() query: GetEpisodeReadDto) {
    return this.episodeReadService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get episode by ID' })
  @ApiResponse({ status: 200, description: 'Return episode details.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.episodeReadService.findOne(id);
  }
}
