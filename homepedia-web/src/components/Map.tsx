"use client";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { Layer, PathOptions, LeafletMouseEvent } from "leaflet";
import type { Feature, GeoJsonObject } from "geojson";
import {
  QUANTILE_COLORS,
  formatPopulation,
  NO_DATA_COLOR,
  type QuantileScale,
} from "@/lib/colorScale";
import type { FilterState } from "./MapFilters";
import MapLegend from "./MapLegend";
import "leaflet/dist/leaflet.css";

const BORDER_COLOR = "#334155";

interface MapProps {
  geoData: GeoJsonObject | null;
  popByIso3: Record<string, number>;
  scale: QuantileScale;
  filter: FilterState;
  popStatus: string;
}

export default function Map({
  geoData,
  popByIso3,
  scale,
  filter,
  popStatus,
}: MapProps) {
  function resolveIso3(props: Record<string, string>): string | undefined {
    const iso = props?.ISO_A3;
    return iso && iso !== "-99" ? iso : (props?.ADM0_A3 ?? undefined);
  }

  function isVisible(fillColor: string, classIdx: number): boolean {
    if (fillColor === NO_DATA_COLOR) return filter.noData;
    return classIdx >= 0 ? filter.classes[classIdx] : true;
  }

  function getFeatureStyle(feature?: Feature): PathOptions {
    const props = feature?.properties as Record<string, string>;
    const iso3 = resolveIso3(props);
    const pop = iso3 ? popByIso3[iso3] : undefined;
    const fillColor = scale.getColor(pop);
    const classIdx = QUANTILE_COLORS.indexOf(
      fillColor as (typeof QUANTILE_COLORS)[number],
    );
    const visible = isVisible(fillColor, classIdx);

    if (!visible) {
      return {
        color: BORDER_COLOR,
        weight: 0.5,
        opacity: 0.2,
        fillColor: "#e5e7eb",
        fillOpacity: 0.1,
      };
    }

    return {
      color: BORDER_COLOR,
      weight: 1,
      opacity: 0.7,
      fillColor,
      fillOpacity: fillColor === NO_DATA_COLOR ? 0.6 : 0.45,
    };
  }

  function onEachFeature(feature: Feature, layer: Layer) {
    const props = feature.properties as Record<string, string>;
    const name = props?.ADMIN ?? props?.NAME ?? "Unknown";
    const iso3 = resolveIso3(props);
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
      fillOpacity: Math.min((defaultStyle.fillOpacity ?? 0.45) + 0.2, 0.9),
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

  const filterKey = `${filter.classes.join("")}-${filter.noData ? 1 : 0}`;

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
          key={`${popStatus}-${filterKey}`}
          data={geoData}
          style={getFeatureStyle}
          onEachFeature={onEachFeature}
        />
      )}
      {popStatus === "succeeded" && <MapLegend scale={scale} />}
    </MapContainer>
  );
}
