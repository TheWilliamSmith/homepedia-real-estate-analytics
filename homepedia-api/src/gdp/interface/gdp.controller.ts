import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { GetGdpUseCase } from '../application/use-cases/get-gdp.use-case.js';

@Controller('gdp')
export class GdpController {
  constructor(private readonly getGdp: GetGdpUseCase) {}

  @Get()
  findAll(@Query('year', new ParseIntPipe({ optional: true })) year?: number) {
    return this.getGdp.execute(year);
  }
}
