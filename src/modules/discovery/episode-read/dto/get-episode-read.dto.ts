import { IsOptional, IsString, IsInt, Min, isInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetEpisodeReadDto {
  @ApiPropertyOptional({ description: 'Search by episode title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Search by episode description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Filter by episode number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  episodeNumber?: number;

  @ApiPropertyOptional({ description: 'Filter by publish date from' })
  @IsOptional()
  @Type(() => Date)
  publishDateFrom?: Date;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 12;
}
