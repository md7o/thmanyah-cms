import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Episode } from './entities/episode.entity';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Program } from '../program/entities/program.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { SearchService } from '../../discovery/search/search.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { generateSlug } from '../../../common/utils/slug.helper';

@Injectable()
export class EpisodeService {
  constructor(
    @InjectRepository(Program) private programRepo: Repository<Program>,
    @InjectRepository(Episode) private episodeRepo: Repository<Episode>,
    private readonly searchService: SearchService,
    @InjectQueue('search-queue') private searchQueue: Queue,
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

    const slug = await this.ensureUniqueSlug(
      createEpisodeDto.slug || generateSlug(createEpisodeDto.title),
      createEpisodeDto.programId,
    );

    const episode = this.episodeRepo.create({ ...createEpisodeDto, slug });
    const savedEpisode = await this.episodeRepo.save(episode);

    await this.searchQueue.add('index-episode', savedEpisode);
    return savedEpisode;
  }

  private async ensureUniqueSlug(slug: string, programId: string, existingId?: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await this.episodeRepo.findOne({
        where: { slug: uniqueSlug, programId },
      });

      if (!existing || (existingId && existing.id === existingId)) {
        return uniqueSlug;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }

  async findAll(
    options: {
      title?: string;
      description?: string;
      episodeNumber?: number;
      publishDateFrom?: Date;
    } = {},
  ): Promise<Episode[]> {
    const { publishDateFrom, ...filters } = options;

    return this.episodeRepo.find({
      where: {
        ...filters,
        ...(publishDateFrom ? { publishDate: MoreThanOrEqual(publishDateFrom) } : {}),
      },
    });
  }

  async findOne(id: string): Promise<Episode> {
    const episode = await this.episodeRepo.findOne({ where: { id } });
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }
    return episode;
  }

  async update(id: string, dto: UpdateEpisodeDto): Promise<Episode> {
    const episode = await this.findOne(id);

    if (dto.programId) {
      const program = await this.programRepo.findOneBy({ id: dto.programId });
      if (!program) throw new NotFoundException('Program not found');
    }

    if (dto.episodeNumber || dto.programId) {
      const existing = await this.episodeRepo.findOne({
        where: {
          programId: dto.programId ?? episode.programId,
          episodeNumber: dto.episodeNumber ?? episode.episodeNumber,
        },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Episode with this number already exists for the program');
      }
    }

    if (dto.slug) {
      dto.slug = await this.ensureUniqueSlug(dto.slug, dto.programId ?? episode.programId, id);
    }

    Object.assign(episode, dto);
    const savedEpisode = await this.episodeRepo.save(episode);
    await this.searchQueue.add('index-episode', savedEpisode);
    return savedEpisode;
  }

  async remove(id: string): Promise<void> {
    const episode = await this.episodeRepo.findOne({ where: { id } });
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }
    await this.episodeRepo.remove(episode);
    await this.searchQueue.add('remove-episode', { id });
  }

  async syncElasticsearch() {
    const episodes = await this.episodeRepo.find();
    await this.searchService.bulkIndexEpisodes(episodes);
    return { count: episodes.length };
  }
}
