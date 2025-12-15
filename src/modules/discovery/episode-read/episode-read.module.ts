import { Module } from '@nestjs/common';
import { EpisodeReadService } from './episode-read.service';
import { EpisodeReadController } from './episode-read.controller';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [SearchModule],
  controllers: [EpisodeReadController],
  providers: [EpisodeReadService],
})
export class EpisodeReadModule {}
