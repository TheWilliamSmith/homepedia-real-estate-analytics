export class PopulationEntry {
  constructor(
    public readonly iso3: string,
    public readonly iso2: string | null,
    public readonly name: string,
    public readonly region: string | null,
    public readonly incomeLevel: string | null,
    public readonly year: number,
    public readonly population: number | null,
  ) {}
}
