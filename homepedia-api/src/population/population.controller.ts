import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { PopulationService } from './population.service.js';

@Controller('population')
export class PopulationController {
  constructor(private readonly populationService: PopulationService) {}

  @Get()
  findAll(@Query('year', new ParseIntPipe({ optional: true })) year?: number) {
    return this.populationService.findAll(year);
  }
}
