import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { ImportService } from './import.service';

@Processor('import-queue')
export class ImportProcessor {
  private readonly logger = new Logger(ImportProcessor.name);

  constructor(private readonly importService: ImportService) {}

  @Process('sync-content')
  async handleSyncContent(job: Job<{ id: string }>) {
    this.logger.log(`Processing sync for import source ${job.data.id}...`);
    try {
      await this.importService.syncContent(job.data.id);
      this.logger.log(`Sync completed for import source ${job.data.id}`);
    } catch (error) {
      this.logger.error(
        `Sync failed for import source ${job.data.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
