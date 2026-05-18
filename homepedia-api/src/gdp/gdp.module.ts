import { Module } from '@nestjs/common';
import { GdpController } from './interface/gdp.controller.js';
import { GetGdpUseCase } from './application/use-cases/get-gdp.use-case.js';
import { GdpPrismaRepository } from './infrastructure/gdp.prisma.repository.js';
import { GDP_REPOSITORY } from './domain/gdp.repository.js';

@Module({
  controllers: [GdpController],
  providers: [
    GetGdpUseCase,
    {
      provide: GDP_REPOSITORY,
      useClass: GdpPrismaRepository,
    },
  ],
})
export class GdpModule {}
