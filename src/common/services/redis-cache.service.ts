import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.redisClient = new Redis({
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: this.configService.get('REDIS_PORT') || 6379,
    });
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  async invalidateCache(pattern: string) {
    const BATCH_SIZE = 1000;
    let cursor = '0';

    try {
      do {
        const [nextCursor, keys] = await this.redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', BATCH_SIZE);

        cursor = nextCursor;

        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      console.error(`Error invalidating cache for pattern ${pattern}:`, error);
    }
  }
}
