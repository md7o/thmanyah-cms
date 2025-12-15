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
      throw error; // Re-throw to let Bull handle retries if configured
    }
  }
}

/** 
 * How it works now:

When create an import source or call /import/:id/sync, it adds a job to Redis.
The ImportProcessor picks up the job in the background and runs the heavy syncContent logic.
Your API responds immediately with "Sync started in background".

 * Now Abou this code in this page:
   is the actual code that runs in the background.
   It takes the data you sent (the id), calls your heavy syncContent logic, and waits for it to finish.
   If this crashes, Bull will catch the error and can automatically retry it later (if configured).
*/
