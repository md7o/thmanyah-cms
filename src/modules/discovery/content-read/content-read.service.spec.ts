import { Test, TestingModule } from '@nestjs/testing';
import { ContentReadService } from './content-read.service';

describe('ProgramService', () => {
  let service: ContentReadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentReadService],
    }).compile();

    service = module.get<ContentReadService>(ContentReadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
