import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { Program } from './../src/modules/cms/program/entities/program.entity';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

describe('Thmanyah CMS Integration (e2e)', () => {
  let app: INestApplication;
  let elasticsearchService: ElasticsearchService;
  let cacheManager: any;
  let programRepo: any;
  let searchQueue: any;

  // Counter for Rate Limiting Test
  let requestCount = 0;

  const mockElasticsearchService = {
    index: jest.fn(),
    search: jest.fn(),
    get: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockProgramRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSearchQueue = {
    add: jest.fn(),
    process: jest.fn(),
    on: jest.fn(),
  };

  // Mock Guard to simulate Rate Limiting
  class MockThrottlerGuard {
    canActivate() {
      requestCount++;
      // Simulate a limit of 3 requests
      if (requestCount > 3) {
        throw new ThrottlerException('Too Many Requests');
      }
      return true;
    }
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ElasticsearchService)
      .useValue(mockElasticsearchService)
      .overrideProvider(CACHE_MANAGER)
      .useValue(mockCacheManager)
      .overrideProvider(getRepositoryToken(Program))
      .useValue(mockProgramRepo)
      .overrideProvider(getQueueToken('search-queue'))
      .useValue(mockSearchQueue)
      .overrideProvider(APP_GUARD)
      .useClass(MockThrottlerGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    elasticsearchService = moduleFixture.get<ElasticsearchService>(ElasticsearchService);
    cacheManager = moduleFixture.get(CACHE_MANAGER);
    programRepo = moduleFixture.get(getRepositoryToken(Program));
    searchQueue = moduleFixture.get(getQueueToken('search-queue'));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    requestCount = 0; // Reset rate limit counter
  });

  describe('CMS Module - Flow Test (Happy Path)', () => {
    it('should create a program, save to DB, and trigger indexing', async () => {
      const createProgramDto = {
        title: 'Test Program',
        description: 'A test program description',
        category: 'Tech',
        language: 'ar',
        source: 'RSS',
        publishDate: new Date().toISOString(),
      };

      const savedProgram = { id: 'uuid-123', ...createProgramDto, createdAt: new Date() };

      mockProgramRepo.findOne.mockResolvedValue(null); // No duplicate
      mockProgramRepo.create.mockReturnValue(savedProgram);
      mockProgramRepo.save.mockResolvedValue(savedProgram);
      mockSearchQueue.add.mockResolvedValue({ id: 1 });

      await request(app.getHttpServer())
        .post('/program')
        .send(createProgramDto)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.id).toEqual(savedProgram.id);
        });

      // Verify DB persistence
      expect(programRepo.save).toHaveBeenCalledWith(expect.objectContaining(createProgramDto));

      // Verify Indexing Trigger
      expect(searchQueue.add).toHaveBeenCalledWith('index-program', expect.objectContaining({ id: savedProgram.id }));
    });
  });

  describe('Discovery Module - Search & Cache', () => {
    it('should fetch from Elasticsearch on first call (Cache Miss)', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockElasticsearchService.search.mockResolvedValue({
        hits: {
          hits: [{ _source: { title: 'Test Program' } }],
        },
      });

      await request(app.getHttpServer())
        .get('/contentRead')
        .query({ title: 'Test' })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].title).toEqual('Test Program');
        });

      expect(elasticsearchService.search).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should fetch from Cache on subsequent calls (Cache Hit)', async () => {
      const cachedResult = [{ title: 'Cached Program' }];
      mockCacheManager.get.mockResolvedValue(cachedResult);

      await request(app.getHttpServer())
        .get('/contentRead')
        .query({ title: 'Test' })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].title).toEqual('Cached Program');
        });

      // Ensure Elasticsearch was NOT called
      expect(elasticsearchService.search).not.toHaveBeenCalled();
    });
  });

  describe('Resilience - Rate Limiting', () => {
    it('should have rate limiting headers present', async () => {
      await request(app.getHttpServer())
        .get('/contentRead')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.headers['x-ratelimit-limit']).toBeDefined();
          expect(res.headers['x-ratelimit-remaining']).toBeDefined();
        });
    });
  });

  describe('Error Handling', () => {
    it('should handle Elasticsearch failure gracefully', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockElasticsearchService.search.mockRejectedValue(new Error('ES Down'));
      await request(app.getHttpServer())
        .get('/contentRead')
        .query({ title: 'Crash' })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
