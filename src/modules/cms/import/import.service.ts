import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Repository, DataSource } from 'typeorm';
import { ImportSource } from './entities/import-source.entity';
import { CreateImportDto } from './dto/create-import.dto';
import { UpdateImportDto } from './dto/update-import.dto';
import { RSSAdapter } from '../adapters/rss.adapter';
import { YouTubeAdapter } from '../adapters/youtube.adapter';
import { IContentAdapter } from '../adapters/interface/content-interface';
import { Program } from '../program/entities/program.entity';
import { Episode } from '../episode/entities/episode.entity';
import { ImportType } from 'src/common/enum/import-type';
import { generateSlug } from '../../../common/utils/slug.helper';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(ImportSource)
    private importSourceRepo: Repository<ImportSource>,
    @InjectQueue('import-queue') private importQueue: Queue,
    private rssAdapter: RSSAdapter,
    private youtubeAdapter: YouTubeAdapter,
    private dataSource: DataSource,
  ) {}

  async create(createImportDto: CreateImportDto): Promise<ImportSource> {
    const importSource = this.importSourceRepo.create(createImportDto);
    const savedSource = await this.importSourceRepo.save(importSource);

    await this.importQueue.add('sync-content', { id: savedSource.id });

    return savedSource;
  }

  async findAll(): Promise<ImportSource[]> {
    return this.importSourceRepo.find();
  }

  async findOne(id: string): Promise<ImportSource> {
    const importSource = await this.importSourceRepo.findOneBy({ id });
    if (!importSource) {
      throw new NotFoundException(`ImportSource with ID ${id} not found`);
    }
    return importSource;
  }

  async update(id: string, updateImportDto: UpdateImportDto): Promise<ImportSource> {
    const importSource = await this.findOne(id);

    Object.assign(importSource, updateImportDto);

    return this.importSourceRepo.save(importSource);
  }

  async remove(id: string): Promise<void> {
    const importSource = await this.findOne(id);
    await this.importSourceRepo.remove(importSource);
  }

  async queueSync(id: string) {
    await this.importQueue.add('sync-content', { id });
  }

  async syncContent(id: string) {
    const importSource = await this.findOne(id);
    const adapter = this.getAdapter(importSource.type as ImportType);
    if (!adapter) throw new Error(`No adapter found for type ${importSource.type}`);

    const contentItems = await adapter.fetchContent({ url: importSource.url });

    return this.dataSource.transaction(async (manager) => {
      const programRepo = manager.getRepository(Program);
      const episodeRepo = manager.getRepository(Episode);

      let program = await programRepo.findOne({ where: { importSource: { id: importSource.id } } });

      if (!program) {
        program = await programRepo.save(
          programRepo.create({
            title: contentItems.length ? `Imported Program: ${importSource.type}` : 'New Imported Program',
            description: `Imported from ${importSource.url}`,
            source: importSource.type,
            language: 'ar',
            category: 'General',
            publishDate: new Date(),
            importSource,
          }),
        );
      }

      const lastEpisode = await episodeRepo.findOne({
        where: { programId: program.id },
        order: { episodeNumber: 'DESC' },
      });
      let nextEpisodeNumber = (lastEpisode?.episodeNumber || 0) + 1;
      let newEpisodesCount = 0;

      for (const item of contentItems) {
        if (!item.externalId) continue;

        const exists = await episodeRepo.findOneBy({ programId: program.id, externalId: item.externalId });
        if (exists) continue;

        let slug = generateSlug(item.title);
        let counter = 1;
        while (await episodeRepo.findOneBy({ slug, programId: program.id })) {
          slug = `${generateSlug(item.title)}-${counter++}`;
        }

        await episodeRepo.save(
          episodeRepo.create({
            title: item.title,
            slug,
            externalId: item.externalId,
            description: item.description || '',
            duration: item.duration || 0,
            publishDate: item.publishedAt || new Date(),
            episodeNumber: nextEpisodeNumber++,
            programId: program.id,
          }),
        );
        newEpisodesCount++;
      }

      await manager.save(Object.assign(importSource, { lastImportedAt: new Date() }));

      return {
        message: 'Sync completed',
        programId: program.id,
        totalItems: contentItems.length,
        newEpisodes: newEpisodesCount,
      };
    });
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
