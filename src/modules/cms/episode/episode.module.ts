import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EpisodeController } from './episode.controller';
import { EpisodeService } from './episode.service';
import { Episode } from './entities/episode.entity';
import { Program } from '../program/entities/program.entity';
import { SearchModule } from '../../discovery/search/search.module';

@Module({
  imports: [TypeOrmModule.forFeature([Episode, Program]), SearchModule],
  controllers: [EpisodeController],
  providers: [EpisodeService],
  exports: [EpisodeService],
})
export class EpisodeModule {}
