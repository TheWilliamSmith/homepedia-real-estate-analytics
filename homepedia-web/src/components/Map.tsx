"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { Layer, PathOptions, LeafletMouseEvent } from "leaflet";
import type { Feature, GeoJsonObject } from "geojson";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { fetchPopulation } from "@/store/populationSlice";
import {
  buildQuantileScale,
  formatPopulation,
  NO_DATA_COLOR,
} from "@/lib/colorScale";
import MapLegend from "./MapLegend";
import "leaflet/dist/leaflet.css";

const BORDER_COLOR = "#334155";

export default function Map({ geoData }: { geoData: GeoJsonObject | null }) {
  const dispatch = useDispatch<AppDispatch>();
  const { data: populationData, status } = useSelector(
    (state: RootState) => state.population,
  );

  useEffect(() => {
    if (status === "idle") dispatch(fetchPopulation());
  }, [dispatch, status]);

  const popByIso3 = useMemo(() => {
    const map: Record<string, number> = {};
    for (const entry of populationData) {
      map[entry.iso3] = entry.population;
    }
    return map;
  }, [populationData]);

  const scale = useMemo(
    () => buildQuantileScale(Object.values(popByIso3)),
    [popByIso3],
  );

  function getFeatureStyle(feature?: Feature): PathOptions {
    const iso3 = (feature?.properties as Record<string, string>)?.ISO_A3;
    const pop = iso3 ? popByIso3[iso3] : undefined;
    const fillColor = scale.getColor(pop);
    return {
      color: BORDER_COLOR,
      weight: 1,
      opacity: 0.7,
      fillColor,
      fillOpacity: fillColor === NO_DATA_COLOR ? 0.15 : 0.45,
    };
  }

  function onEachFeature(feature: Feature, layer: Layer) {
    const props = feature.properties as Record<string, string>;
    const name = props?.ADMIN ?? props?.NAME ?? "Unknown";
    const iso3 = props?.ISO_A3;
    const pop = iso3 ? popByIso3[iso3] : undefined;

    const popLine =
      pop != null
        ? `<span class="tooltip-pop">${formatPopulation(pop)} hab.</span>`
        : `<span class="tooltip-nodata">Données indisponibles</span>`;

    layer.bindTooltip(`<span class="tooltip-name">${name}</span>${popLine}`, {
      sticky: true,
      className: "country-tooltip",
    });

    const defaultStyle = getFeatureStyle(feature);
    const hoverStyle: Partial<PathOptions> = {
      weight: 2,
      opacity: 1,
      fillOpacity: Math.min((defaultStyle.fillOpacity ?? 0.6) + 0.2, 0.9),
    };

    layer.on({
      mouseover(e: LeafletMouseEvent) {
        e.target.setStyle(hoverStyle);
        e.target.bringToFront();
      },
      mouseout(e: LeafletMouseEvent) {
        e.target.setStyle(defaultStyle);
      },
    });
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      maxBounds={[
        [-90, -180],
        [90, 180],
      ]}
      maxBoundsViscosity={1.0}
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {geoData && (
        <GeoJSON
          key={status}
          data={geoData}
          style={getFeatureStyle}
          onEachFeature={onEachFeature}
        />
      )}
      {status === "succeeded" && <MapLegend scale={scale} />}
    </MapContainer>
  );
}
