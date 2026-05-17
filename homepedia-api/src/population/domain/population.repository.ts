import { PopulationEntry } from './population.entity.js';

export const POPULATION_REPOSITORY = Symbol('IPopulationRepository');

export interface IPopulationRepository {
  findByYear(year: number): Promise<PopulationEntry[]>;
  findLatestYear(): Promise<number | null>;
}
