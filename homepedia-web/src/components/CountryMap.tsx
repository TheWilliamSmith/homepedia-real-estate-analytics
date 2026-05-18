"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { Feature, GeoJsonObject } from "geojson";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function FitBounds({ feature }: { feature: Feature }) {
  const map = useMap();
  useEffect(() => {
    try {
      const bounds = L.geoJSON(feature as GeoJsonObject).getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [32, 32] });
    } catch {
      // invalid geometry
    }
  }, [map, feature]);
  return null;
}

export default function CountryMap({ feature }: { feature: Feature }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={3}
      zoomControl={false}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      attributionControl={false}
      className="w-full h-full"
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <GeoJSON
        data={feature as GeoJsonObject}
        style={{
          color: "#0f172a",
          weight: 1.5,
          fillColor: "#0f172a",
          fillOpacity: 0.12,
        }}
      />
      <FitBounds feature={feature} />
    </MapContainer>
  );
}
