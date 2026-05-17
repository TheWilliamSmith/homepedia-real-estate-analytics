import { Inject, Injectable } from '@nestjs/common';
import { PopulationEntry } from '../../domain/population.entity.js';
import { POPULATION_REPOSITORY } from '../../domain/population.repository.js';
import type { IPopulationRepository } from '../../domain/population.repository.js';

export interface GetPopulationResult {
  year: number | null;
  total: number;
  data: PopulationEntry[];
}

@Injectable()
export class GetPopulationUseCase {
  constructor(
    @Inject(POPULATION_REPOSITORY)
    private readonly repository: IPopulationRepository,
  ) {}

  async execute(year?: number): Promise<GetPopulationResult> {
    const targetYear = year ?? (await this.repository.findLatestYear());

    if (targetYear === null) {
      return { year: null, total: 0, data: [] };
    }

    const data = await this.repository.findByYear(targetYear);

    return { year: targetYear, total: data.length, data };
  }
}
