import { Injectable } from '@nestjs/common';
import { ProgramService as CmsProgramService } from '../../cms/program/program.service';

@Injectable()
export class ProgramService {
  constructor(private readonly cmsProgramService: CmsProgramService) {}

  async findAll() {
    return this.cmsProgramService.findAll();
  }
}
