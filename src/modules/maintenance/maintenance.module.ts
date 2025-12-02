import { Module } from '@nestjs/common';
import { MaintenanceController } from './maintenance.controller';
import { CmsModule } from '../cms/cms.module';

@Module({
  imports: [CmsModule],
  controllers: [MaintenanceController],
})
export class MaintenanceModule {}
