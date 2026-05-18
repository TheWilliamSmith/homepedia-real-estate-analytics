"use client";

import {
  QUANTILE_COLORS,
  NO_DATA_COLOR,
  formatPopulation,
} from "@/lib/colorScale";
import type { QuantileScale } from "@/lib/colorScale";

export interface FilterState {
  classes: boolean[]; // 5 booleans — un par quintile
  noData: boolean;
  customRange: { min: number; max: number | null } | null;
}

export const DEFAULT_FILTER: FilterState = {
  classes: [true, true, true, true, true],
  noData: true,
  customRange: null,
};

interface Props {
  scale: QuantileScale;
  filter: FilterState;
  onChange: (filter: FilterState) => void;
}

function classLabel(i: number, breaks: number[]): string {
  if (breaks.length === 0) return `Classe ${i + 1}`;
  if (i === 0) return `< ${formatPopulation(breaks[0])}`;
  if (i === QUANTILE_COLORS.length - 1)
    return `≥ ${formatPopulation(breaks[i - 1])}`;
  return `${formatPopulation(breaks[i - 1])} – ${formatPopulation(breaks[i])}`;
}

function classesFromSelect(value: string): boolean[] {
  if (value === "all") return Array(5).fill(true) as boolean[];
  const idx = parseInt(value, 10);
  return Array.from({ length: 5 }, (_, i) => i === idx) as boolean[];
}

function selectFromClasses(classes: boolean[]): string {
  const checked = classes.map((v, i) => (v ? i : -1)).filter((i) => i !== -1);
  if (checked.length === 5) return "all";
  if (checked.length === 1) return String(checked[0]);
  return "all";
}

export default function MapFilters({ scale, filter, onChange }: Props) {
  const selectValue = selectFromClasses(filter.classes);

  function handlePopulationChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange({ ...filter, classes: classesFromSelect(e.target.value) });
  }

  return (
    <div className="flex items-center gap-5 px-4 py-2.5 bg-white border-b border-gray-200 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 select-none">
        Filtres
      </span>

      {/* Population */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="pop-filter"
          className="text-sm font-medium text-gray-600 whitespace-nowrap"
        >
          Population
        </label>
        <select
          id="pop-filter"
          value={selectValue}
          onChange={handlePopulationChange}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
        >
          <option value="all">Toutes</option>
          {QUANTILE_COLORS.map((_, i) => (
            <option key={i} value={String(i)}>
              {classLabel(i, scale.breaks)}
            </option>
          ))}
        </select>
      </div>

      {/* Données inconnues */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={filter.noData}
          onChange={() => onChange({ ...filter, noData: !filter.noData })}
          className="accent-red-500 w-4 h-4 cursor-pointer"
        />
        <span
          className="w-3 h-3 rounded-sm flex-shrink-0"
          style={{ backgroundColor: NO_DATA_COLOR }}
        />
        <span className="text-sm text-gray-600">Données inconnues</span>
      </label>
    </div>
  );
}
