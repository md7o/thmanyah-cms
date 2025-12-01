import { IsOptional, IsString, IsInt, Min, isInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetEpisodeReadDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  episodeNumber?: number;

  @IsOptional()
  @Type(() => Date)
  publishDateFrom?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 12;
}
