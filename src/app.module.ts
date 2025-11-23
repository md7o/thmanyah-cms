import { Inject, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getPostgresConfig } from './config/database.config';
import { ContentModule } from './modules/content/content.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getPostgresConfig(configService),
    }),
    ContentModule,
    DiscoveryModule,
  ],
})
export class AppModule {}
