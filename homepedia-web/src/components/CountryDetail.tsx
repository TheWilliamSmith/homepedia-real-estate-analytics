"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { FeatureCollection, Feature } from "geojson";
import type { AppDispatch, RootState } from "@/store";
import { fetchPopulation } from "@/store/populationSlice";
import { fetchGdp } from "@/store/gdpSlice";
import { formatPopulation, formatGdpPerCapita } from "@/lib/colorScale";

const CountryMap = dynamic(() => import("./CountryMap"), { ssr: false });

interface Props {
  iso3: string;
}

function resolveIso3(props: Record<string, string>): string | undefined {
  const iso = props?.ISO_A3;
  return iso && iso !== "-99" ? iso : (props?.ADM0_A3 ?? undefined);
}

export default function CountryDetail({ iso3 }: Props) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { data: populationData, status } = useSelector(
    (s: RootState) => s.population,
  );
  const { data: gdpData, status: gdpStatus } = useSelector(
    (s: RootState) => s.gdp,
  );

  useEffect(() => {
    fetch("/data/countries.geo.json")
      .then((r) => r.json())
      .then(setGeoData);
    if (status === "idle") dispatch(fetchPopulation());
    if (gdpStatus === "idle") dispatch(fetchGdp());
  }, [dispatch, status, gdpStatus]);

  const feature = useMemo(() => {
    if (!geoData) return null;
    return (
      (geoData.features.find((f) => {
        const props = f.properties as Record<string, string>;
        return resolveIso3(props) === iso3;
      }) as Feature) ?? null
    );
  }, [geoData, iso3]);

  const popEntry = useMemo(
    () => populationData.find((e) => e.iso3 === iso3),
    [populationData, iso3],
  );
  const gdpEntry = useMemo(
    () => gdpData.find((e) => e.iso3 === iso3),
    [gdpData, iso3],
  );

  const countryName =
    (feature?.properties as Record<string, string> | null)?.ADMIN ??
    (feature?.properties as Record<string, string> | null)?.NAME ??
    gdpEntry?.name ??
    popEntry?.name ??
    iso3;

  const loading = !geoData || status === "loading" || gdpStatus === "loading";

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-gray-400 text-sm">
        Chargement...
      </div>
    );
  }

  return (
    <div className="bg-white min-h-full">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Back */}
        <Link
          href="/pays"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
        >
          ← Retour
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {countryName}
          </h1>
          {(gdpEntry?.region || gdpEntry?.incomeLevel) && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {gdpEntry?.region && (
                <span className="text-sm text-gray-400">{gdpEntry.region}</span>
              )}
              {gdpEntry?.region && gdpEntry?.incomeLevel && (
                <span className="text-gray-200">·</span>
              )}
              {gdpEntry?.incomeLevel && (
                <span className="text-sm text-gray-400">
                  {gdpEntry.incomeLevel}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Map */}
        {feature && (
          <div className="w-full h-72 rounded-2xl overflow-hidden border border-gray-100 mb-8">
            <CountryMap feature={feature} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-100 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Population
            </p>
            {popEntry ? (
              <>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                  {formatPopulation(popEntry.population)}
                </p>
                <p className="text-sm text-gray-400 mt-1">{popEntry.year}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">Données indisponibles</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              GDP par habitant
            </p>
            {gdpEntry ? (
              <>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                  {formatGdpPerCapita(gdpEntry.gdpPerCapita)}
                </p>
                <p className="text-sm text-gray-400 mt-1">{gdpEntry.year}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">Données indisponibles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
