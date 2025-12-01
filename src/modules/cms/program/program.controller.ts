import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Put,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreateContentDto } from '../dto/content-dto/create-content.dto';
import { ProgramService } from './program.service';
import { UpdateContentDto } from '../dto/content-dto/update-content.dto';

@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Get()
  async findAll() {
    return this.programService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.programService.findOne(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createContentDto: CreateContentDto) {
    return this.programService.create(createContentDto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto) {
    return this.programService.update(id, updateContentDto);
  }
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.programService.remove(id);
  }

  @Post('sync')
  async sync() {
    return this.programService.syncElasticsearch();
  }
  // curl -X POST http://localhost:3000/program/sync
}
