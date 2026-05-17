import { Module } from '@nestjs/common';
import { PopulationController } from './interface/population.controller.js';
import { GetPopulationUseCase } from './application/use-cases/get-population.use-case.js';
import { PopulationPrismaRepository } from './infrastructure/population.prisma.repository.js';
import { POPULATION_REPOSITORY } from './domain/population.repository.js';

@Module({
  controllers: [PopulationController],
  providers: [
    GetPopulationUseCase,
    {
      provide: POPULATION_REPOSITORY,
      useClass: PopulationPrismaRepository,
    },
  ],
})
export class PopulationModule {}
