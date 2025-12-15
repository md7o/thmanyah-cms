import { IsString, IsNotEmpty, IsInt, IsDateString, IsUUID, IsOptional } from 'class-validator';

export class CreateEpisodeDto {
  @IsUUID()
  programId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsInt()
  duration: number;

  @IsDateString()
  publishDate: Date;

  @IsInt()
  episodeNumber: number;
}
