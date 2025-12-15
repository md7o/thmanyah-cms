import { Controller, Get, Post, Body, Param, Delete, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { ImportService } from './import.service';
import { CreateImportDto } from './dto/create-import.dto';
import { UpdateImportDto } from './dto/update-import.dto';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createImportDto: CreateImportDto) {
    return this.importService.create(createImportDto);
  }

  @Get()
  async findAll() {
    return this.importService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.importService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id') id: string, @Body() updateImportDto: UpdateImportDto) {
    return this.importService.update(id, updateImportDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.importService.remove(id);
  }

  @Post(':id/sync')
  async sync(@Param('id') id: string) {
    await this.importService.queueSync(id);
    return { message: 'Sync started in background' };
  }
}
