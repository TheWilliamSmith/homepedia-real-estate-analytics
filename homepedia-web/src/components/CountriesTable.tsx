"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { fetchPopulation } from "@/store/populationSlice";
import type { PopulationEntry } from "@/store/populationSlice";
import { buildQuantileScale, formatPopulation } from "@/lib/colorScale";

type SortKey = "population" | "name" | "region";
type SortDir = "asc" | "desc";

const REGIONS = [
  "Toutes les régions",
  "East Asia & Pacific",
  "Europe & Central Asia",
  "Latin America & Caribbean",
  "Middle East & North Africa",
  "North America",
  "South Asia",
  "Sub-Saharan Africa",
];

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-gray-300 ml-1">↕</span>;
  return (
    <span className="text-blue-500 ml-1">{dir === "asc" ? "↑" : "↓"}</span>
  );
}

export default function CountriesTable() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, status } = useSelector((s: RootState) => s.population);

  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("Toutes les régions");
  const [sortKey, setSortKey] = useState<SortKey>("population");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    if (status === "idle") dispatch(fetchPopulation());
  }, [dispatch, status]);

  const scale = useMemo(
    () => buildQuantileScale(data.map((d) => d.population)),
    [data],
  );

  const maxPop = useMemo(
    () => Math.max(...data.map((d) => d.population), 1),
    [data],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list: PopulationEntry[] = data.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q);
      const matchRegion =
        region === "Toutes les régions" || d.region === region;
      return matchSearch && matchRegion;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "population") cmp = a.population - b.population;
      else if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else cmp = a.region.localeCompare(b.region);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [data, search, region, sortKey, sortDir]);

  const totalPop = useMemo(
    () => filtered.reduce((sum, d) => sum + d.population, 0),
    [filtered],
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function thClass(key: SortKey) {
    return `px-4 py-3 font-semibold text-gray-500 cursor-pointer hover:text-gray-800 select-none text-left ${
      sortKey === key ? "text-gray-800" : ""
    }`;
  }

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Chargement des données…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Population par pays
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {filtered.length} pays · {formatPopulation(totalPop)}{" "}
            d&apos;habitants
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Rechercher un pays…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-4 py-3 font-semibold text-gray-400 w-10 text-right">
                #
              </th>
              <th
                className={thClass("name")}
                onClick={() => toggleSort("name")}
              >
                Pays <SortIcon active={sortKey === "name"} dir={sortDir} />
              </th>
              <th
                className={`${thClass("region")} hidden md:table-cell`}
                onClick={() => toggleSort("region")}
              >
                Région <SortIcon active={sortKey === "region"} dir={sortDir} />
              </th>
              <th
                className={`${thClass("population")} text-right`}
                onClick={() => toggleSort("population")}
              >
                Population{" "}
                <SortIcon active={sortKey === "population"} dir={sortDir} />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, i) => {
              const barPct = (entry.population / maxPop) * 100;
              const color = scale.getColor(entry.population);
              return (
                <tr
                  key={entry.iso3}
                  className="border-b border-gray-50 last:border-0 hover:bg-blue-50/40 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-300 text-xs text-right tabular-nums">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">
                      {entry.name}
                    </div>
                    <div className="text-xs text-gray-400 md:hidden mt-0.5">
                      {entry.region}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                    {entry.region}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <div className="w-28 hidden sm:block flex-shrink-0">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${barPct}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                      <span className="font-medium text-gray-700 tabular-nums text-right w-20">
                        {formatPopulation(entry.population)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-12 text-gray-400 text-sm">
            Aucun pays trouvé.
          </p>
        )}
      </div>
    </div>
  );
}
