import { Injectable } from '@nestjs/common';
import { CreateDiscoveryDto } from './dto/create-discovery.dto';
import { UpdateDiscoveryDto } from './dto/update-discovery.dto';

@Injectable()
export class DiscoveryService {
  create(createDiscoveryDto: CreateDiscoveryDto) {
    return 'This action adds a new discovery';
  }

  findAll() {
    return `This action returns all discovery`;
  }

  findOne(id: number) {
    return `This action returns a #${id} discovery`;
  }

  update(id: number, updateDiscoveryDto: UpdateDiscoveryDto) {
    return `This action updates a #${id} discovery`;
  }

  remove(id: number) {
    return `This action removes a #${id} discovery`;
  }
}
