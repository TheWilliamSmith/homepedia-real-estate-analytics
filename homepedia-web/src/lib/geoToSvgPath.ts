import type { Geometry } from "geojson";

type Coord = [number, number];

export function geoToSvgPaths(
  geometry: Geometry,
  viewSize = 100,
  padding = 8,
): string {
  const rings: Coord[][] = [];

  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) rings.push(ring as Coord[]);
  } else if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates)
      for (const ring of polygon) rings.push(ring as Coord[]);
  } else {
    return "";
  }

  let minLon = Infinity,
    maxLon = -Infinity,
    minLat = Infinity,
    maxLat = -Infinity;

  for (const ring of rings) {
    for (const [lon, lat] of ring) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }

  const lonRange = maxLon - minLon || 1;
  const latRange = maxLat - minLat || 1;
  const innerSize = viewSize - 2 * padding;
  const scale = Math.min(innerSize / lonRange, innerSize / latRange);
  const offsetX = padding + (innerSize - lonRange * scale) / 2;
  const offsetY = padding + (innerSize - latRange * scale) / 2;

  return rings
    .map(
      (ring) =>
        ring
          .map(([lon, lat], i) => {
            const x = (lon - minLon) * scale + offsetX;
            const y = viewSize - ((lat - minLat) * scale + offsetY);
            return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
          })
          .join(" ") + " Z",
    )
    .join(" ");
}
