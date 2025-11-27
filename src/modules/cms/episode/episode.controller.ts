import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { EpisodeService } from './episode.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';

@Controller('episode')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createEpisode(@Body() createEpisodeDto: CreateEpisodeDto) {
    return this.episodeService.createEpisode(createEpisodeDto);
  }

  @Get()
  async findAll() {
    return this.episodeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.episodeService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEpisodeDto: UpdateEpisodeDto,
  ) {
    return this.episodeService.update(id, updateEpisodeDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.episodeService.remove(id);
  }
}
