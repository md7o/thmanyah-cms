import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateEpisodeDto {
  @IsUUID()
  programId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  duration: number;

  @IsDateString()
  publishDate: Date;

  @IsInt()
  episodeNumber: number;
}
