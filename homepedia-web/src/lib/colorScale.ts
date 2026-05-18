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
