import { IsString, IsNotEmpty, IsUrl, IsEnum } from 'class-validator';

export enum ImportType {
  YOUTUBE = 'YOUTUBE',
  RSS = 'RSS',
}

export class CreateImportDto {
  @IsEnum(ImportType)
  @IsNotEmpty()
  type: ImportType;

  @IsUrl()
  @IsNotEmpty()
  url: string;
}
