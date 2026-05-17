"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { GeoJsonObject } from "geojson";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function MapWrapper() {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);

  useEffect(() => {
    fetch("/data/countries.geo.json")
      .then((r) => r.json())
      .then(setGeoData);
  }, []);

  return <Map geoData={geoData} />;
}
