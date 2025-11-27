import { Module } from '@nestjs/common';
import { ProgramModule } from './program/program.module';
import { EpisodeModule } from './episode/episode.module';
import { ImportModule } from './import/import.module';

@Module({
  imports: [ProgramModule, EpisodeModule, ImportModule],
  exports: [ProgramModule, EpisodeModule, ImportModule],
})
export class CmsModule {}
