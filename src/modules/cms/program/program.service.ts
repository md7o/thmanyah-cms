import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import { CreateContentDto } from '../dto/content-dto/create-content.dto';
import { UpdateContentDto } from '../dto/content-dto/update-content.dto';
import { SearchService } from '../../discovery/search/search.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program) private programRepo: Repository<Program>,
    private readonly searchService: SearchService,
    @InjectQueue('search-queue') private searchQueue: Queue,
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
      throw new ConflictException('Program with this title and source already exists');
    }

    const program = this.programRepo.create({
      ...createContentDto,
    });

    const savedProgram = await this.programRepo.save(program);
    await this.searchQueue.add('index-program', savedProgram);

    return savedProgram;
  }

  async findAll(options?: {
    title?: string;
    description?: string;
    category?: string;
    language?: string;
    source: string;
    page?: number;
    limit?: number;
  }): Promise<Program[]> {
    const { page = 1, limit = 12, ...filters } = options || {};
    const filterParams = filters as Record<string, unknown>;

    const queryBuilder = this.programRepo.createQueryBuilder('program');

    Object.keys(filterParams).forEach((key) => {
      if (filterParams[key] !== undefined && filterParams[key] !== null) {
        queryBuilder.andWhere(`program.${key} = :${key}`, {
          [key]: filterParams[key],
        });
      }
    });

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Program> {
    const program = await this.programRepo.findOneBy({ id });
    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    return program;
  }

  // Update Method
  async update(id: string, updateContentDto: UpdateContentDto): Promise<Program> {
    const updateProgram = await this.programRepo.findOneBy({ id });
    if (!updateProgram) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    const savedProgram = await this.programRepo.save({
      ...updateProgram,
      ...updateContentDto,
    });
    await this.searchQueue.add('update-program', savedProgram);
    return savedProgram;
  }

  // Remove Method
  async remove(id: string): Promise<void> {
    const removeProgram = await this.programRepo.findOneBy({ id });

    if (!removeProgram) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    await this.programRepo.remove(removeProgram);
    await this.searchQueue.add('remove-program', { id });
  }

  async syncElasticsearch() {
    const programs = await this.programRepo.find();
    await this.searchService.bulkIndexPrograms(programs);
    return { count: programs.length };
  }
}
