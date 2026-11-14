# ADR-003: MapLibre GL for the map

- Status: Accepted
- Date: 2026-11-14

## Context

The map shows the six hotspots and, later, radar PNG overlays positioned by
their bounding boxes. It must be free and open source, need no API key, and
follow the light and dark themes.

## Options considered

- **MapLibre GL (chosen):** WebGL vector basemaps that can be restyled for each theme, `image` sources for the radar PNGs, open source and needs no key.
- **Leaflet:** smaller and simpler, but built around raster tiles. Vector basemaps and smooth theme switching would need extra plugins.
- **deck.gl:** made for large WebGL data layers and heavier, and it still needs a basemap library underneath. Six points and a few PNGs do not need it.

## Decision

- **MapLibre GL JS 6.**
- Basemap from **OpenFreeMap**: style `positron` (light) and `dark`. It needs
  no key and uses OpenStreetMap data. These style URLs (`features/mapa/basemap.ts`)
  are the only full URLs in the app. The "relative paths only" rule covers
  our own `/api` and `/dados`, and third-party tiles cannot come from our
  domain.
- Hotspots: a GeoJSON source with two circle layers (normal and selected). The
  selected marker is bigger and has a thicker ring, not only a new color.
  Colors come from `tokens.css` at runtime (`readToken`). Changing the theme
  reloads the basemap, and the markers are added again on `style.load`.
- Radar overlays (next step): an `image` source with the PNG's `bbox` as
  corner coordinates.
- The map loads on demand (`React.lazy`). Its worker URL is set with
  `setWorkerUrl` and a Vite `?url` import, because MapLibre 6 otherwise looks
  for the worker next to its own file, which is not where Vite puts it.
- MapLibre 6 needs WebGL2. Without it, or if the map code fails to download,
  the map area shows a message, and the hotspot list (the text alternative)
  keeps working.

## Consequences

- The map is a separate chunk of about 290 kB gzip that loads after the
  header and the list.
- The basemap depends on OpenFreeMap, which offers no SLA. If it fails, change
  the two URLs in `basemap.ts`.
- The attribution control must stay visible (OpenStreetMap license).
- MapLibre's control labels are translated through its `locale` option and
  updated when the language changes.
