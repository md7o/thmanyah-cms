import { IsNotEmpty, IsUrl, IsEnum } from 'class-validator';
import { ImportType } from 'src/common/enum/import-type';

export class CreateImportDto {
  @IsEnum(ImportType)
  @IsNotEmpty()
  type: ImportType;

  @IsUrl()
  @IsNotEmpty()
  url: string;
}
