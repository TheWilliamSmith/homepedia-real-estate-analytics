import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PopulationEntry } from '../domain/population.entity.js';
import { IPopulationRepository } from '../domain/population.repository.js';

@Injectable()
export class PopulationPrismaRepository implements IPopulationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByYear(year: number): Promise<PopulationEntry[]> {
    const rows = await this.prisma.populationData.findMany({
      where: { year },
      include: {
        country: {
          select: {
            iso3: true,
            iso2: true,
            name: true,
            region: true,
            incomeLevel: true,
          },
        },
      },
      orderBy: { country: { name: 'asc' } },
    });

    return rows.map(
      (row) =>
        new PopulationEntry(
          row.country.iso3,
          row.country.iso2,
          row.country.name,
          row.country.region,
          row.country.incomeLevel,
          row.year,
          row.value !== null ? Number(row.value) : null,
        ),
    );
  }

  async findLatestYear(): Promise<number | null> {
    const result = await this.prisma.populationData.findFirst({
      orderBy: { year: 'desc' },
      select: { year: true },
    });
    return result?.year ?? null;
  }
}
