import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { ImportSource } from './entities/import-source.entity';
import { RSSAdapter } from '../adapters/rss.adapter';
import { YouTubeAdapter } from '../adapters/youtube.adapter';
import { Program } from '../program/entities/program.entity';
import { Episode } from '../episode/entities/episode.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImportSource, Program, Episode])],
  controllers: [ImportController],
  providers: [ImportService, RSSAdapter, YouTubeAdapter],
  exports: [ImportService],
})
export class ImportModule {}
