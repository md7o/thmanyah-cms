import { Module } from '@nestjs/common';
import { ContentReadService } from './content-read.service';
import { ContentReadController } from './content-read.controller';
import { CmsModule } from '../../cms/cms.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [CmsModule, SearchModule],
  controllers: [ContentReadController],
  providers: [ContentReadService],
})
export class ContentReadModule {}
