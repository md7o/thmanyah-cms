import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { CreateDiscoveryDto } from './dto/create-discovery.dto';
import { UpdateDiscoveryDto } from './dto/update-discovery.dto';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Post()
  create(@Body() createDiscoveryDto: CreateDiscoveryDto) {
    return this.discoveryService.create(createDiscoveryDto);
  }

  @Get()
  findAll() {
    return this.discoveryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discoveryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiscoveryDto: UpdateDiscoveryDto) {
    return this.discoveryService.update(+id, updateDiscoveryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discoveryService.remove(+id);
  }
}
