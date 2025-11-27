import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Episode } from './entities/episode.entity';
import { Repository } from 'typeorm';
import { Program } from '../program/entities/program.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';

@Injectable()
export class EpisodeService {
  constructor(
    @InjectRepository(Program) private programRepo: Repository<Program>,
    @InjectRepository(Episode) private episodeRepo: Repository<Episode>,
  ) {}

  async createEpisode(createEpisodeDto: CreateEpisodeDto): Promise<Episode> {
    // Ensure the program exists
    const program = await this.programRepo.findOneBy({
      id: createEpisodeDto.programId,
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const existing = await this.episodeRepo.findOne({
      where: {
        programId: createEpisodeDto.programId,
        episodeNumber: createEpisodeDto.episodeNumber,
      },
    });

    if (existing) {
      throw new ConflictException('This Episode already exists');
    }

    const episode = this.episodeRepo.create({ ...createEpisodeDto });
    const savedEpisode = await this.episodeRepo.save(episode);
    return savedEpisode as Episode;
  }

  async findAll(): Promise<Episode[]> {
    return this.episodeRepo.find();
  }

  async findOne(id: number): Promise<Episode> {
    const episode = await this.episodeRepo.findOne({ where: { id } });
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }
    return episode;
  }

  async update(id: number, dto: UpdateEpisodeDto): Promise<Episode> {
    const episode = await this.episodeRepo.findOne({ where: { id } });
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    if (dto.programId) {
      const program = await this.programRepo.findOneBy({ id: dto.programId });
      if (!program) {
        throw new NotFoundException('Program not found');
      }
    }

    const newProgramId = dto.programId ?? episode.programId;
    const newEpisodeNumber = dto.episodeNumber ?? episode.episodeNumber;

    const existing = await this.episodeRepo.findOne({
      where: {
        programId: newProgramId,
        episodeNumber: newEpisodeNumber,
      },
    });

    if (existing && existing.id !== id) {
      throw new ConflictException(
        'Episode with this number already exists for the program',
      );
    }

    Object.assign(episode, dto);
    return this.episodeRepo.save(episode);
  }

  async remove(id: number): Promise<void> {
    const episode = await this.episodeRepo.findOne({ where: { id } });
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }
    await this.episodeRepo.remove(episode);
  }
}
