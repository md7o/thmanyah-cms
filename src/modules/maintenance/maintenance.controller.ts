import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProgramService } from '../cms/program/program.service';
import { EpisodeService } from '../cms/episode/episode.service';

@ApiTags('Maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(
    private readonly programService: ProgramService,
    private readonly episodeService: EpisodeService,
  ) {}

  @Post('sync/programs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync all programs to Elasticsearch' })
  @ApiResponse({ status: 200, description: 'Programs synced successfully' })
  async syncPrograms() {
    return this.programService.syncElasticsearch();
  }

  @Post('sync/episodes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync all episodes to Elasticsearch' })
  @ApiResponse({ status: 200, description: 'Episodes synced successfully' })
  async syncEpisodes() {
    return this.episodeService.syncElasticsearch();
  }
}
