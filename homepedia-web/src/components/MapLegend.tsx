"use client";

import { useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import type { QuantileScale } from "@/lib/colorScale";
import {
  QUANTILE_COLORS,
  NO_DATA_COLOR,
  formatPopulation,
} from "@/lib/colorScale";

interface MapLegendProps {
  scale: QuantileScale;
}

export default function MapLegend({ scale }: MapLegendProps) {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);

  useEffect(() => {
    if (controlRef.current) {
      controlRef.current.remove();
    }

    const LegendControl = L.Control.extend({
      onAdd() {
        const div = L.DomUtil.create("div", "map-legend");

        const classes = QUANTILE_COLORS.map((color, i) => {
          const from = i === 0 ? 0 : scale.breaks[i - 1];
          const to = scale.breaks[i];
          const label =
            i === QUANTILE_COLORS.length - 1
              ? `> ${formatPopulation(scale.breaks[i - 1])}`
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

        return div;
      },
    });

    const control = new LegendControl({ position: "bottomright" });
    control.addTo(map);
    controlRef.current = control;

    return () => {
      control.remove();
    };
  }, [map, scale]);

  return null;
}
