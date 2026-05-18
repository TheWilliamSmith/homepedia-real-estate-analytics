"use client";

import { useEffect, useState, useMemo } from "react";
import type { FeatureCollection } from "geojson";
import CountryCard from "./CountryCard";

function resolveIso3(props: Record<string, string>): string | undefined {
  const iso = props?.ISO_A3;
  return iso && iso !== "-99" ? iso : (props?.ADM0_A3 ?? undefined);
}

interface CountryItem {
  iso3: string;
  iso2: string;
  name: string;
}

const CONTINENT_STYLES: Record<
  string,
  { border: string; text: string; label: string }
> = {
  Africa: {
    border: "border-amber-400",
    text: "text-amber-500",
    label: "Afrique",
  },
  Asia: { border: "border-red-400", text: "text-red-500", label: "Asie" },
  Europe: {
    border: "border-blue-500",
    text: "text-blue-600",
    label: "Europe",
  },
  "North America": {
    border: "border-emerald-500",
    text: "text-emerald-600",
    label: "Amérique du Nord",
  },
  "South America": {
    border: "border-cyan-500",
    text: "text-cyan-600",
    label: "Amérique du Sud",
  },
  Oceania: {
    border: "border-violet-500",
    text: "text-violet-600",
    label: "Océanie",
  },
};

const EXCLUDED = new Set(["Seven seas (open ocean)", "Antarctica"]);

export default function CountriesGrid() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetch("/data/countries.geo.json")
      .then((r) => r.json())
      .then(setGeoData);
  }, []);

  const byContinent = useMemo(() => {
    if (!geoData) return {} as Record<string, CountryItem[]>;
    const groups: Record<string, CountryItem[]> = {};
    for (const f of geoData.features) {
      const props = f.properties as Record<string, string>;
      const iso3 = resolveIso3(props);
      const iso2 = props?.ISO_A2 ?? "";
      const name = props?.ADMIN ?? props?.NAME ?? "";
      const continent = props?.CONTINENT ?? "Unknown";
      if (!iso3 || !name || EXCLUDED.has(continent)) continue;
      if (!groups[continent]) groups[continent] = [];
      groups[continent].push({ iso3, iso2, name });
    }
    for (const c in groups) {
      groups[c].sort((a, b) => a.name.localeCompare(b.name));
    }
    return groups;
  }, [geoData]);

  const continents = useMemo(
    () => Object.keys(byContinent).sort(),
    [byContinent],
  );

  if (!geoData) {
    return (
      <div className="flex items-center justify-center p-20 text-gray-400 text-sm">
        Chargement...
      </div>
    );
  }

  // ── Country list ──────────────────────────────────────────────
  if (selectedContinent !== null) {
    const countries = byContinent[selectedContinent] ?? [];
    const style = CONTINENT_STYLES[selectedContinent];
    return (
      <div className="min-h-full bg-gray-50">
        <div className="px-4 py-6 md:px-8">
          <button
            onClick={() => setSelectedContinent(null)}
            className="text-sm text-blue-500 hover:text-blue-700 mb-6 inline-flex items-center gap-1"
          >
            ← Tous les continents
          </button>
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {style?.label ?? selectedContinent}
            </h2>
            <span className="text-sm text-gray-400">
              {countries.length} pays
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
            {countries.map(({ iso3, iso2, name }) => (
              <CountryCard key={iso3} iso3={iso3} iso2={iso2} name={name} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Continent list ────────────────────────────────────────────
  const total = Object.values(byContinent).reduce((s, c) => s + c.length, 0);
  return (
    <div className="min-h-full bg-gray-50">
      <div className="px-4 py-6 md:px-8">
        <div className="flex items-baseline gap-3 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Continents</h2>
          <span className="text-sm text-gray-400">{total} pays</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {continents.map((continent) => {
            const style = CONTINENT_STYLES[continent];
            const count = byContinent[continent]?.length ?? 0;
            return (
              <button
                key={continent}
                onClick={() => setSelectedContinent(continent)}
                className={`group flex flex-col items-center justify-center rounded-2xl h-44 bg-white border-2 ${style?.border ?? "border-gray-300"} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 cursor-pointer`}
              >
                <div
                  className={`text-xl font-bold uppercase tracking-widest ${
                    style?.text ?? "text-gray-700"
                  }`}
                >
                  {style?.label ?? continent}
                </div>
                <div className="text-sm text-gray-400 mt-2">{count} pays</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
