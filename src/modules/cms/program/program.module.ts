import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';
import { Episode } from '../episode/entities/episode.entity';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';

@Module({
  imports: [TypeOrmModule.forFeature([Program, Episode])],
  controllers: [ProgramController],
  providers: [ProgramService],
  exports: [ProgramService],
})
export class ProgramModule {}
