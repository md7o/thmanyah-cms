import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';
import { Episode } from '../episode/entities/episode.entity';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';
import { SearchModule } from '../../discovery/search/search.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([Program, Episode]),
    SearchModule,
    BullModule.registerQueue({
      name: 'search-queue',
    }),
  ],
  controllers: [ProgramController],
  providers: [ProgramService],
  exports: [ProgramService],
})
export class ProgramModule {}
