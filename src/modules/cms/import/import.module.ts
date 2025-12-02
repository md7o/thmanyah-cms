import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { ImportProcessor } from './import.processor';
import { ImportSource } from './entities/import-source.entity';
import { RSSAdapter } from '../adapters/rss.adapter';
import { YouTubeAdapter } from '../adapters/youtube.adapter';
import { Program } from '../program/entities/program.entity';
import { Episode } from '../episode/entities/episode.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImportSource, Program, Episode]),
    BullModule.registerQueue({
      name: 'import-queue',
    }),
  ],
  controllers: [ImportController],
  providers: [ImportService, ImportProcessor, RSSAdapter, YouTubeAdapter],
  exports: [ImportService],
})
export class ImportModule {}
