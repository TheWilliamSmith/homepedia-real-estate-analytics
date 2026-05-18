import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { GdpEntry } from '../domain/gdp.entity.js';
import { IGdpRepository } from '../domain/gdp.repository.js';

@Injectable()
export class GdpPrismaRepository implements IGdpRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByYear(year: number): Promise<GdpEntry[]> {
    const rows = await this.prisma.gdpData.findMany({
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
        new GdpEntry(
          row.country.iso3,
          row.country.iso2,
          row.country.name,
          row.country.region,
          row.country.incomeLevel,
          row.year,
          row.value ?? null,
        ),
    );
  }

  async findLatestYear(): Promise<number | null> {
    const result = await this.prisma.gdpData.findFirst({
      orderBy: { year: 'desc' },
      select: { year: true },
    });
    return result?.year ?? null;
  }
}
