import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PopulationModule } from './population/population.module.js';
import { GdpModule } from './gdp/gdp.module.js';

@Module({
  imports: [PrismaModule, PopulationModule, GdpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
