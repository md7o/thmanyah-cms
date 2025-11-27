import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import { Episode } from '../episode/entities/episode.entity';
import { CreateContentDto } from '../dto/content-dto/create-content.dto';
import { UpdateContentDto } from '../dto/content-dto/update-content.dto';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program) private programRepo: Repository<Program>,
    @InjectRepository(Episode) private episodeRepo: Repository<Episode>,
  ) {}

  // Create Method
  async create(createContentDto: CreateContentDto): Promise<Program> {
    const existing = await this.programRepo.findOne({
      where: {
        title: createContentDto.title,
        source: createContentDto.source,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Program with this title and source already exists',
      );
    }

    const program = this.programRepo.create({
      ...createContentDto,
    });

    const savedProgram = await this.programRepo.save(program);

    return savedProgram;
  }

  async findAll(): Promise<Program[]> {
    return this.programRepo.find();
  }

  async findOne(id: string): Promise<Program> {
    const program = await this.programRepo.findOneBy({ id });
    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    return program;
  }

  // Update Method
  async update(
    id: string,
    updateContentDto: UpdateContentDto,
  ): Promise<Program> {
    const updateProgram = await this.programRepo.findOneBy({ id });
    if (!updateProgram) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    return this.programRepo.save({
      ...updateProgram,
      ...updateContentDto,
    } as any);
  }

  // Remove Method
  async remove(id: string): Promise<void> {
    const removeProgram = await this.programRepo.findOneBy({ id });

    if (!removeProgram) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    await this.programRepo.remove(removeProgram);
  }
}
