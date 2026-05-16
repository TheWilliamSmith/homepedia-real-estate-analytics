import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PopulationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(year?: number) {
    const targetYear = year ?? (await this.getLatestYear());

    if (targetYear === null) {
      return { year: null, data: [] };
    }

    const rows = await this.prisma.populationData.findMany({
      where: { year: targetYear },
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

    return {
      year: targetYear,
      total: rows.length,
      data: rows.map((row) => ({
        iso3: row.country.iso3,
        iso2: row.country.iso2,
        name: row.country.name,
        region: row.country.region,
        incomeLevel: row.country.incomeLevel,
        population: row.value !== null ? Number(row.value) : null,
      })),
    };
  }

  private async getLatestYear(): Promise<number | null> {
    const result = await this.prisma.populationData.findFirst({
      orderBy: { year: 'desc' },
      select: { year: true },
    });
    return result?.year ?? null;
  }
}
