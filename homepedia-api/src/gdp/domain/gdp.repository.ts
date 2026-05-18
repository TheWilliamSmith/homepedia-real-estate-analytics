import { GdpEntry } from './gdp.entity.js';

export const GDP_REPOSITORY = Symbol('IGdpRepository');

export interface IGdpRepository {
  findByYear(year: number): Promise<GdpEntry[]>;
  findLatestYear(): Promise<number | null>;
}
