import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { GetPopulationUseCase } from '../application/use-cases/get-population.use-case.js';

@Controller('population')
export class PopulationController {
  constructor(private readonly getPopulation: GetPopulationUseCase) {}

  @Get()
  findAll(@Query('year', new ParseIntPipe({ optional: true })) year?: number) {
    return this.getPopulation.execute(year);
  }
}
