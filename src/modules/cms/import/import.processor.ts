import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { ImportService } from './import.service';

@Processor('import-queue')
export class ImportProcessor {
  constructor(private readonly importService: ImportService) {}

  @Process('sync-content')
  async handleSyncContent(job: Job<{ id: number }>) {
    console.log(`Processing sync for import source ${job.data.id}...`);
    await this.importService.syncContent(job.data.id);
    console.log(`Sync completed for import source ${job.data.id}`);
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
