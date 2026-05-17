/** Blues 5-class palette (ColorBrewer) — du plus clair au plus foncé */
export const QUANTILE_COLORS = [
  "#c6dbef",
  "#9ecae1",
  "#6baed6",
  "#3182bd",
  "#08519c",
] as const;

export const NO_DATA_COLOR = "#ef4444";

export interface QuantileScale {
  /** Valeurs de coupure entre chaque classe (4 seuils pour 5 classes) */
  breaks: number[];
  getColor: (population: number | undefined) => string;
}

/**
 * Construit une échelle quantile à 5 classes à partir d'une liste de populations.
 * Chaque classe contient ~20% des pays.
 */
export function buildQuantileScale(populations: number[]): QuantileScale {
  if (populations.length === 0) {
    return { breaks: [], getColor: () => NO_DATA_COLOR };
  }

  const sorted = [...populations].sort((a, b) => a - b);
  const n = sorted.length;

  // 4 seuils pour 5 classes (quintiles)
  const breaks = [1, 2, 3, 4].map((i) => sorted[Math.floor((i * n) / 5) - 1]);

  const getColor = (population: number | undefined): string => {
    if (population == null) return NO_DATA_COLOR;
    for (let i = 0; i < breaks.length; i++) {
      if (population <= breaks[i]) return QUANTILE_COLORS[i];
    }
    return QUANTILE_COLORS[4];
  };

  return { breaks, getColor };
}

/** Formate un nombre de population de façon lisible (ex: 68 000 000 → "68,0 M") */
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
