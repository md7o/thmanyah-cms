import { Module } from '@nestjs/common';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { CmsModule } from '../../cms/cms.module';

@Module({
  imports: [CmsModule],
  controllers: [ProgramController],
  providers: [ProgramService],
})
export class ProgramModule {}
