import { Module } from '@nestjs/common';
import { ContentReadService } from './content-read.service';
import { ContentReadController } from './content-read.controller';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [SearchModule],
  controllers: [ContentReadController],
  providers: [ContentReadService],
})
export class ContentReadModule {}
