"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { GeoJsonObject } from "geojson";
import type { AppDispatch, RootState } from "@/store";
import { fetchPopulation } from "@/store/populationSlice";
import { buildQuantileScale } from "@/lib/colorScale";
import MapFilters, { DEFAULT_FILTER, type FilterState } from "./MapFilters";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function MapWrapper() {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);

  const dispatch = useDispatch<AppDispatch>();
  const { data: populationData, status } = useSelector(
    (s: RootState) => s.population,
  );

  useEffect(() => {
    fetch("/data/countries.geo.json")
      .then((r) => r.json())
      .then(setGeoData);
    if (status === "idle") dispatch(fetchPopulation());
  }, [dispatch, status]);

  const popByIso3 = useMemo(() => {
    const map: Record<string, number> = {};
    for (const entry of populationData) map[entry.iso3] = entry.population;
    return map;
  }, [populationData]);

  const scale = useMemo(
    () => buildQuantileScale(Object.values(popByIso3)),
    [popByIso3],
  );

  return (
    <div className="flex flex-col h-full">
      {status === "succeeded" && (
        <MapFilters scale={scale} filter={filter} onChange={setFilter} />
      )}
      <div className="flex-1 min-h-0 relative">
        <Map
          geoData={geoData}
          popByIso3={popByIso3}
          scale={scale}
          filter={filter}
          popStatus={status}
        />
      </div>
    </div>
  );
}
