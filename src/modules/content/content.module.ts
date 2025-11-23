import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';
import { Provider } from './entities/provider.entity';
import { Program } from './entities/program.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Program, Provider, Tag, Category])],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [TypeOrmModule],
})
export class ContentModule {}
