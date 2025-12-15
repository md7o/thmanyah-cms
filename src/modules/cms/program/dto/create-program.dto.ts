import { IsString, IsNotEmpty, IsDateString, IsInt } from 'class-validator';
export class CreateProgramDto {
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
  publishDate: Date;

  @IsString()
  @IsNotEmpty()
  source: string;

  @IsInt()
  @IsNotEmpty()
  importSource: number;
}
