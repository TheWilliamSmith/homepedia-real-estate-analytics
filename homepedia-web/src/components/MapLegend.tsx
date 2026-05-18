"use client";

import { useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import type { QuantileScale } from "@/lib/colorScale";
import {
  QUANTILE_COLORS,
  GDP_COLORS,
  NO_DATA_COLOR,
  formatPopulation,
  formatGdpPerCapita,
  INCOME_LEVELS,
  INCOME_COLORS,
} from "@/lib/colorScale";
import type { MapLayer } from "./MapFilters";

interface MapLegendProps {
  scale: QuantileScale;
  gdpScale: QuantileScale;
  layer: MapLayer;
}

export default function MapLegend({ scale, gdpScale, layer }: MapLegendProps) {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);

  useEffect(() => {
    if (controlRef.current) {
      controlRef.current.remove();
    }

    const LegendControl = L.Control.extend({
      onAdd() {
        const div = L.DomUtil.create("div", "map-legend");

        if (layer === "income") {
          const rows = INCOME_LEVELS.map(
            (lvl) =>
              `<div class="legend-row">
                <span class="legend-swatch" style="background:${INCOME_COLORS[lvl]}"></span>
                <span class="legend-label">${lvl}</span>
              </div>`,
          ).join("");
          div.innerHTML = `
            <div class="legend-title">Niveau de revenu</div>
            ${rows}
            <div class="legend-row">
              <span class="legend-swatch" style="background:${NO_DATA_COLOR}"></span>
              <span class="legend-label">Données indisponibles</span>
            </div>`;
        } else if (layer === "gdp") {
          const classes = GDP_COLORS.map((color, i) => {
            const from = i === 0 ? 0 : gdpScale.breaks[i - 1];
            const to = gdpScale.breaks[i];
            const label =
              i === GDP_COLORS.length - 1
                ? `≥ ${formatGdpPerCapita(gdpScale.breaks[i - 1])}`
                : `${formatGdpPerCapita(from)} – ${formatGdpPerCapita(to)}`;
            return `
              <div class="legend-row">
                <span class="legend-swatch" style="background:${color}"></span>
                <span class="legend-label">${label}</span>
              </div>`;
          });
          div.innerHTML = `
            <div class="legend-title">GDP par hab. (2023)</div>
            ${classes.join("")}
            <div class="legend-row">
              <span class="legend-swatch" style="background:${NO_DATA_COLOR}"></span>
              <span class="legend-label">Données indisponibles</span>
            </div>`;
        } else {
          const classes = QUANTILE_COLORS.map((color, i) => {
            const from = i === 0 ? 0 : scale.breaks[i - 1];
            const to = scale.breaks[i];
            const label =
              i === QUANTILE_COLORS.length - 1
                ? `≥ ${formatPopulation(scale.breaks[i - 1])}`
                : `${formatPopulation(from)} – ${formatPopulation(to)}`;
            return `
              <div class="legend-row">
                <span class="legend-swatch" style="background:${color}"></span>
                <span class="legend-label">${label}</span>
              </div>`;
          });
          div.innerHTML = `
            <div class="legend-title">Population (2023)</div>
            ${classes.join("")}
            <div class="legend-row">
              <span class="legend-swatch" style="background:${NO_DATA_COLOR}"></span>
              <span class="legend-label">Données indisponibles</span>
            </div>`;
        }

        return div;
      },
    });

    const control = new LegendControl({ position: "bottomright" });
    control.addTo(map);
    controlRef.current = control;

    return () => {
      control.remove();
    };
  }, [map, scale, gdpScale, layer]);

  return null;
}
