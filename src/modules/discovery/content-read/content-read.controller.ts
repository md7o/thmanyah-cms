import { Controller, Get, Param, Query } from '@nestjs/common';
import { ContentReadService } from './content-read.service';
import { GetContentReadDto } from './dto/get-content-read.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Discovery - Content')
@Controller('contentRead')
export class ContentReadController {
  constructor(private readonly contentReadService: ContentReadService) {}

  @Get()
  @ApiOperation({
    summary: 'Search programs',
    description:
      'Search for programs using filters. You can use query parameters like ?title=فنجان to search by title.',
  })
  @ApiResponse({ status: 200, description: 'Return list of programs.' })
  async findAll(@Query() query: GetContentReadDto) {
    return this.contentReadService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get program by ID' })
  @ApiResponse({ status: 200, description: 'Return program details.' })
  async findById(@Param('id') id: string) {
    return this.contentReadService.findById(id);
  }
}
