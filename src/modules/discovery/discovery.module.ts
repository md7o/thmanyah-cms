import { Module } from '@nestjs/common';

import { ContentReadModule } from './content-read/content-read.module';
import { EpisodeReadModule } from './episode-read/episode-read.module';

@Module({
  imports: [ContentReadModule, EpisodeReadModule],
})
export class DiscoveryModule {}
