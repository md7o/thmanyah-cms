import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getPostgresConfig } from './config/database.config';
import { CmsModule } from './modules/cms/cms.module';
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
    CmsModule,
    DiscoveryModule,
  ],
})
export class AppModule {}
