export const QUANTILE_COLORS = [
  "#c6dbef",
  "#9ecae1",
  "#6baed6",
  "#3182bd",
  "#08306b",
] as const;

export const NO_DATA_COLOR = "#ef4444";

export interface QuantileScale {
  breaks: number[];
  getColor: (population: number | undefined) => string;
}

export function buildQuantileScale(populations: number[]): QuantileScale {
  if (populations.length === 0) {
    return { breaks: [], getColor: () => NO_DATA_COLOR };
  }

  const sorted = [...populations].filter((n) => n > 0).sort((a, b) => a - b);
  const n = sorted.length;

  const q1 = sorted[Math.floor(n * 0.2)] ?? 5_000_000;
  const q2 = sorted[Math.floor(n * 0.4)] ?? 15_000_000;
  const breaks = [q1, q2, 41_000_000, 100_000_000];

  const getColor = (population: number | undefined): string => {
    if (population == null || population <= 0) return NO_DATA_COLOR;
    for (let i = 0; i < breaks.length; i++) {
      if (population < breaks[i]) return QUANTILE_COLORS[i];
    }
    return QUANTILE_COLORS[4];
  };

  return { breaks, getColor };
}

export function formatPopulation(population: number): string {
  if (population >= 1_000_000_000) {
    return `${(population / 1_000_000_000).toFixed(2)} Md`;
  }
  if (population >= 1_000_000) {
    return `${(population / 1_000_000).toFixed(1)} M`;
  }
  if (population >= 1_000) {
    return `${(population / 1_000).toFixed(0)} k`;
  }
  return population.toLocaleString();
}

// ---- Income levels (World Bank) ----
export const INCOME_LEVELS = [
  "Low income",
  "Lower middle income",
  "Upper middle income",
  "High income",
] as const;

export type IncomeLevel = (typeof INCOME_LEVELS)[number];

export const INCOME_COLORS: Record<IncomeLevel, string> = {
  "Low income": "#d73027",
  "Lower middle income": "#fc8d59",
  "Upper middle income": "#91cf60",
  "High income": "#1a9850",
};

export function getIncomeColor(level: string | undefined): string {
  if (!level || !(level in INCOME_COLORS)) return NO_DATA_COLOR;
  return INCOME_COLORS[level as IncomeLevel];
}

// ---- GDP per capita ----
export const GDP_COLORS = [
  "#f2f0f7",
  "#cbc9e2",
  "#9e9ac8",
  "#756bb1",
  "#54278f",
] as const;

export function formatGdpPerCapita(value: number): string {
  if (value >= 10_000) {
    return `${(value / 1_000).toFixed(0)} k$`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)} k$`;
  }
  return `${Math.round(value)} $`;
}

export function buildGdpScale(values: number[]): QuantileScale {
  if (values.length === 0) {
    return { breaks: [], getColor: () => NO_DATA_COLOR };
  }
  const sorted = [...values].filter((n) => n > 0).sort((a, b) => a - b);
  const n = sorted.length;
  const breaks = [1, 2, 3, 4].map(
    (i) => sorted[Math.floor((i * n) / 5)],
  ) as number[];

  const getColor = (value: number | undefined): string => {
    if (value == null || value <= 0) return NO_DATA_COLOR;
    for (let i = 0; i < breaks.length; i++) {
      if (value < breaks[i]) return GDP_COLORS[i];
    }
    return GDP_COLORS[4];
  };

  return { breaks, getColor };
}
