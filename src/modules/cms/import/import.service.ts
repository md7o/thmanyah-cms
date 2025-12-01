import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImportSource } from './entities/import-source.entity';
import { CreateImportDto } from './dto/create-import.dto';
import { UpdateImportDto } from './dto/update-import.dto';
import { RSSAdapter } from '../adapters/rss.adapter';
import { YouTubeAdapter } from '../adapters/youtube.adapter';
import { IContentAdapter } from '../adapters/interface/content-interface';
import { Program } from '../program/entities/program.entity';
import { Episode } from '../episode/entities/episode.entity';
import { ImportType } from 'src/common/enum/import-type';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(ImportSource)
    private importSourceRepo: Repository<ImportSource>,
    @InjectRepository(Program)
    private programRepo: Repository<Program>,
    @InjectRepository(Episode)
    private episodeRepo: Repository<Episode>,
    private rssAdapter: RSSAdapter,
    private youtubeAdapter: YouTubeAdapter,
  ) {}

  async create(createImportDto: CreateImportDto): Promise<ImportSource> {
    const importSource = this.importSourceRepo.create(createImportDto);
    const savedSource = await this.importSourceRepo.save(importSource);

    try {
      await this.syncContent(savedSource.id);
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }

    return savedSource;
  }

  async findAll(): Promise<ImportSource[]> {
    return this.importSourceRepo.find();
  }

  async findOne(id: number): Promise<ImportSource> {
    const importSource = await this.importSourceRepo.findOneBy({ id });
    if (!importSource) {
      throw new NotFoundException(`ImportSource with ID ${id} not found`);
    }
    return importSource;
  }

  async update(id: number, updateImportDto: UpdateImportDto): Promise<ImportSource> {
    const importSource = await this.findOne(id);

    Object.assign(importSource, updateImportDto);

    return this.importSourceRepo.save(importSource);
  }

  async remove(id: number): Promise<void> {
    const importSource = await this.findOne(id);
    await this.importSourceRepo.remove(importSource);
  }

  async syncContent(id: number) {
    const importSource = await this.findOne(id);
    const adapter = this.getAdapter(importSource.type as ImportType);

    if (!adapter) {
      throw new Error(`No adapter found for type ${importSource.type}`);
    }

    const contentItems = await adapter.fetchContent({ url: importSource.url });

    // Find or Create Program linked to this ImportSource
    let program = await this.programRepo.findOne({
      where: { importSource: { id: importSource.id } },
    });

    if (!program) {
      const programTitle = contentItems.length > 0 ? `Imported Program: ${importSource.type}` : 'New Imported Program';

      program = this.programRepo.create({
        title: programTitle,
        description: `Imported from ${importSource.url}`,
        source: importSource.type,
        language: 'ar', // This will be default value
        category: 'General', // This will be default value
        publishDate: new Date(),
        importSource: importSource,
      });
      program = await this.programRepo.save(program);
    }

    // Sync Episodes
    let newEpisodesCount = 0;

    const lastEpisode = await this.episodeRepo.findOne({
      where: { programId: program.id },
      order: { episodeNumber: 'DESC' },
    });
    let nextEpisodeNumber = (lastEpisode?.episodeNumber || 0) + 1;

    for (const item of contentItems) {
      if (!item.externalId) {
        console.warn(`Skipping item "${item.title}" No externalId`);
        continue;
      }

      const existingEpisode = await this.episodeRepo.findOne({
        where: {
          programId: program.id,
          externalId: item.externalId,
        },
      });

      if (!existingEpisode) {
        const episode = this.episodeRepo.create({
          title: item.title,
          externalId: item.externalId,
          description: item.description || '',
          duration: item.duration || 0,
          publishDate: item.publishedAt || new Date(),
          episodeNumber: nextEpisodeNumber++,
          programId: program.id,
        });
        await this.episodeRepo.save(episode);
        newEpisodesCount++;
      }
    }

    importSource.lastImportedAt = new Date();
    await this.importSourceRepo.save(importSource);

    return {
      message: 'Sync completed',
      programId: program.id,
      totalItems: contentItems.length,
      newEpisodes: newEpisodesCount,
    };
  }

  private getAdapter(type: ImportType): IContentAdapter | undefined {
    switch (type) {
      case ImportType.RSS:
        return this.rssAdapter;
      case ImportType.YOUTUBE:
        return this.youtubeAdapter;
      default:
        return undefined;
    }
  }
}
