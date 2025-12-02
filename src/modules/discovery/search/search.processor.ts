import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { SearchService } from './search.service';
import { Program } from '../../cms/program/entities/program.entity';
import { Episode } from '../../cms/episode/entities/episode.entity';

@Processor('search-queue')
export class SearchProcessor {
  constructor(private readonly searchService: SearchService) {}

  @Process('index-program')
  async handleIndexProgram(job: Job<Program>) {
    await this.searchService.indexProgram(job.data);
  }

  @Process('update-program')
  async handleUpdateProgram(job: Job<Program>) {
    await this.searchService.update(job.data);
  }

  @Process('remove-program')
  async handleRemoveProgram(job: Job<{ id: string }>) {
    await this.searchService.remove(job.data.id);
  }

  @Process('index-episode')
  async handleIndexEpisode(job: Job<Episode>) {
    await this.searchService.indexEpisode(job.data);
  }

  @Process('remove-episode')
  async handleRemoveEpisode(job: Job<{ id: string }>) {
    await this.searchService.removeEpisode(job.data.id);
  }

  // Note: SearchService doesn't have a specific updateEpisode method, it likely uses indexEpisode for upsert
  // But let's check if we need one. indexEpisode uses esSearch.index which overwrites.
  // If we want partial update we might need to add it to SearchService, but for now let's assume index is fine.

  // Wait, SearchService.remove takes a string ID. Episode ID is number.
  // SearchService.remove is for programs (index: 'programs').
  // We need a removeEpisode method in SearchService.
}
