import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
export class CreateContentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsDateString()
  @IsNotEmpty()
  publishDate: string;

  @IsString()
  @IsNotEmpty()
  source: string;
}
