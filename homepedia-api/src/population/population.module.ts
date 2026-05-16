import { Module } from '@nestjs/common';
import { PopulationController } from './population.controller.js';
import { PopulationService } from './population.service.js';

@Module({
  controllers: [PopulationController],
  providers: [PopulationService],
})
export class PopulationModule {}
