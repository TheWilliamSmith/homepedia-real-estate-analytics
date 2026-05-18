import { Inject, Injectable } from '@nestjs/common';
import { GDP_REPOSITORY } from '../../domain/gdp.repository.js';
import type { IGdpRepository } from '../../domain/gdp.repository.js';
import { GdpEntry } from '../../domain/gdp.entity.js';

export interface GetGdpResult {
  year: number | null;
  total: number;
  data: GdpEntry[];
}

@Injectable()
export class GetGdpUseCase {
  constructor(
    @Inject(GDP_REPOSITORY)
    private readonly repository: IGdpRepository,
  ) {}

  async execute(year?: number): Promise<GetGdpResult> {
    const targetYear = year ?? (await this.repository.findLatestYear());

    if (targetYear === null) {
      return { year: null, total: 0, data: [] };
    }

    const data = await this.repository.findByYear(targetYear);

    return { year: targetYear, total: data.length, data };
  }
}
