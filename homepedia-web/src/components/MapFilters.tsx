"use client";

import {
  QUANTILE_COLORS,
  NO_DATA_COLOR,
  formatPopulation,
  formatGdpPerCapita,
  GDP_COLORS,
  INCOME_LEVELS,
  INCOME_COLORS,
} from "@/lib/colorScale";
import type { QuantileScale } from "@/lib/colorScale";

export type MapLayer = "population" | "income" | "gdp";

export interface FilterState {
  layer: MapLayer;
  classes: boolean[];
  noData: boolean;
  incomeFilter: string;
  gdpFilter: string;
}

export const DEFAULT_FILTER: FilterState = {
  layer: "population",
  classes: [true, true, true, true, true],
  noData: true,
  incomeFilter: "all",
  gdpFilter: "all",
};

interface Props {
  scale: QuantileScale;
  gdpScale: QuantileScale;
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

function gdpLabel(i: number, breaks: number[]): string {
  if (breaks.length === 0) return `Classe ${i + 1}`;
  if (i === 0) return `< ${formatGdpPerCapita(breaks[0])}`;
  if (i === GDP_COLORS.length - 1)
    return `≥ ${formatGdpPerCapita(breaks[i - 1])}`;
  return `${formatGdpPerCapita(breaks[i - 1])} – ${formatGdpPerCapita(breaks[i])}`;
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

export default function MapFilters({
  scale,
  gdpScale,
  filter,
  onChange,
}: Props) {
  const selectValue = selectFromClasses(filter.classes);

  function handlePopulationChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange({ ...filter, classes: classesFromSelect(e.target.value) });
  }

  return (
    <div className="flex items-center gap-5 px-4 py-2.5 bg-white border-b border-gray-200 shadow-sm">
      {/* Layer selector */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="layer-select"
          className="text-sm font-medium text-gray-600 whitespace-nowrap"
        >
          Couche
        </label>
        <select
          id="layer-select"
          value={filter.layer}
          onChange={(e) =>
            onChange({ ...filter, layer: e.target.value as MapLayer })
          }
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
        >
          <option value="population">Population</option>
          <option value="income">Revenus</option>
          <option value="gdp">GDP par hab.</option>
        </select>
      </div>

      <div className="w-px h-4 bg-gray-200" />

      {filter.layer === "population" && (
        <>
          {/* Population filter */}
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

          {/* No data */}
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
        </>
      )}

      {filter.layer === "income" && (
        <div className="flex items-center gap-2">
          <label
            htmlFor="income-filter"
            className="text-sm font-medium text-gray-600 whitespace-nowrap"
          >
            Niveau de revenu
          </label>
          <select
            id="income-filter"
            value={filter.incomeFilter}
            onChange={(e) =>
              onChange({ ...filter, incomeFilter: e.target.value })
            }
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
          >
            <option value="all">Tous</option>
            {INCOME_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      )}

      {filter.layer === "gdp" && (
        <div className="flex items-center gap-2">
          <label
            htmlFor="gdp-filter"
            className="text-sm font-medium text-gray-600 whitespace-nowrap"
          >
            GDP par hab.
          </label>
          <select
            id="gdp-filter"
            value={filter.gdpFilter}
            onChange={(e) => onChange({ ...filter, gdpFilter: e.target.value })}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
          >
            <option value="all">Tous</option>
            {GDP_COLORS.map((_, i) => (
              <option key={i} value={String(i)}>
                {gdpLabel(i, gdpScale.breaks)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
