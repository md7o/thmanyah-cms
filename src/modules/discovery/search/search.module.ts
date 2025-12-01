import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SearchService } from './search.service';
import { ClientOptions } from '@elastic/elasticsearch';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore as unknown as string,
        host: configService.get('REDIS_HOST') || 'localhost',
        port: configService.get('REDIS_PORT') || 6379,
        ttl: 600,
      }),
      inject: [ConfigService],
    }),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const node = configService.get<string>('ELASTICSEARCH_NODE') || 'http://localhost:9200'; // "||" for local dev
        const username = configService.get<string>('ELASTICSEARCH_USERNAME') || 'elastic'; // "||" for local dev
        const password = configService.get<string>('ELASTICSEARCH_PASSWORD') || 'changeme'; // "||" for local dev

        const config: ClientOptions = { node };
        if (username && password) {
          config.auth = { username, password };
        }
        return config;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
