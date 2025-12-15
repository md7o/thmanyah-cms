import { Module } from '@nestjs/common';
import { ProgramModule } from './program/program.module';
import { EpisodeModule } from './episode/episode.module';
import { ImportModule } from './import/import.module';
import { CircuitBreakerService } from '../../common/services/circuit-breaker.service';

@Module({
  imports: [ProgramModule, EpisodeModule, ImportModule],
  providers: [CircuitBreakerService],
  exports: [ProgramModule, EpisodeModule, ImportModule, CircuitBreakerService],
})
export class CmsModule {}
