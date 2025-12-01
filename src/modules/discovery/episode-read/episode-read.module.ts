import { Module } from '@nestjs/common';
import { EpisodeReadService } from './episode-read.service';
import { EpisodeReadController } from './episode-read.controller';
import { EpisodeModule } from '../../cms/episode/episode.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [EpisodeModule, SearchModule],
  controllers: [EpisodeReadController],
  providers: [EpisodeReadService],
})
export class EpisodeReadModule {}
