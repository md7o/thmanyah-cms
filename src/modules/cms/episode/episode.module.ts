import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EpisodeController } from './episode.controller';
import { EpisodeService } from './episode.service';
import { Episode } from './entities/episode.entity';
import { Program } from '../program/entities/program.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Episode, Program])],
  controllers: [EpisodeController],
  providers: [EpisodeService],
  exports: [EpisodeService],
})
export class EpisodeModule {}
