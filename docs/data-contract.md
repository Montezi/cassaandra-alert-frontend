# Data contract: `hotspots.geojson`

The Python pipeline writes `public/dados/hotspots.geojson`. The frontend only
reads it (ADR-002, ADR-004) and validates it with the zod schema in
[`src/shared/lib/hotspotSchema.ts`](../src/shared/lib/hotspotSchema.ts). If the
file does not match, the app shows an error state instead of the map, and the
browser console lists each field that failed.

Change this document, the schema and the pipeline together.

## Shape

A GeoJSON `FeatureCollection` with one `Point` per hotspot. The example is
sample data (`"sample": true`): do not copy its numbers into real files.

```json
{
  "type": "FeatureCollection",
  "metadata": { "sample": true, "schema_version": 2, "generated_at": "2026-11-14T09:00:00Z" },
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [-51.2, -30.0] },
      "properties": {
        "id": "guaiba-rs",
        "name": { "pt": "Lago Guaíba, RS", "en": "Guaíba Lake, RS (Brazil)" },
        "enso_effect": { "pt": "chuva acima da média", "en": "above-average rainfall" },
        "dominant_class": "flood",
        "affected_area_km2": 212,
        "confidence": 0.86,
        "last_pass": "2026-11-12",
        "baseline_pass": "2026-01-14",
        "threshold_db": 3,
        "bbox": [-51.35, -30.25, -51.0, -29.85],
        "layers": { "flood": "layers/guaiba-rs/flood.png" }
      }
    }
  ]
}
```

## Fields

| Field               | Type                             | Null? | Meaning                                                                                                                          |
| ------------------- | -------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| `geometry`          | `Point`, `[longitude, latitude]` | no    | Marker position, WGS 84 degrees. Longitude first.                                                                                |
| `id`                | string                           | no    | Lowercase slug (`guaiba-rs`). Unique and stable: it goes into shared links (`?hotspot=guaiba-rs`).                               |
| `name`              | `{ "pt": string, "en": string }` | no    | Display name in both languages.                                                                                                  |
| `short_name`        | `{ "pt": string, "en": string }` | —     | Optional. Short label for the map marker and the list ("Lago Guaíba"). Missing: `name` is used.                                  |
| `enso_effect`       | `{ "pt": string, "en": string }` | yes   | Expected El Niño effect in the region. Context, not a measurement.                                                               |
| `dominant_class`    | one of the classes below         | yes   | See "Dominant class" below.                                                                                                      |
| `affected_area_km2` | number ≥ 0                       | yes   | Area of `dominant_class` between `baseline_pass` and `last_pass`, at `threshold_db`, in km².                                     |
| `confidence`        | number from 0 to 1               | yes   | See "Confidence" below.                                                                                                          |
| `last_pass`         | `"YYYY-MM-DD"`                   | yes   | Latest radar pass used (the "after" image).                                                                                      |
| `baseline_pass`     | `"YYYY-MM-DD"`                   | yes   | Pass the change was measured against (the "before" image).                                                                       |
| `threshold_db`      | number > 0                       | yes   | Change threshold used for the area: `2`, `3` or `4` dB.                                                                          |
| `bbox`              | `[west, south, east, north]`     | no    | Area of interest in degrees. `west < east`, `south < north` (no hotspot crosses the 180° meridian). The point must be inside it. |
| `layers`            | object: lens → path              | no    | PNG overlays (see "Map layers" below). Use `{}` when there are none.                                                             |

Classes for `dominant_class`: `flood`, `drought`, `fire_deforestation`,
`deformation`, `stable`.

`metadata` (optional object):

- `sample`: `true` marks hand-made data with approximate positions and
  illustrative values; the app then shows a "sample data" badge next to
  every number from that file. The pipeline writes `false`.
- `schema_version`: version of this contract the file follows. Current: `2`.
- `generated_at`: when the pipeline wrote the file, ISO 8601 in UTC
  (`2026-11-14T09:00:00Z`). Lets the app and Cass say how old the data is.

### Dominant class

The **change** class (`flood`, `drought`, `fire_deforestation`,
`deformation`) with the largest area between `baseline_pass` and
`last_pass`. `stable` only when no change class reaches the minimum area,
**0.5 km²** (to tune in the pipeline). Without this rule almost every
hotspot would be `stable`, because most of any crop does not change.

### Confidence

PROPOSAL, to confirm with the pipeline: the mean probability, given by the
decision tree, of the cells labelled `dominant_class`. It is **not
calibrated** (the tree is trained on weak labels), so the app never shows it
as a probability of being right: it shows "model confidence" and a level.

| Level  | Rule   | PT    | EN     |
| ------ | ------ | ----- | ------ |
| high   | ≥ 0.75 | alta  | high   |
| medium | ≥ 0.50 | média | medium |
| low    | < 0.50 | baixa | low    |

The app (`confidenceLevel` in `src/features/painel/selection.ts`) and the
Cass agent must use the same cut points. Validation precision against JRC,
Sentinel-1, DETER and FIRMS is a separate number (landing page table).

## Rules

- Measured values (`dominant_class`, `affected_area_km2`, `confidence`,
  `last_pass`) are `null` until the pipeline computes them. Never write a
  placeholder number: the app would show it as measured. The only exception
  is a file with `metadata.sample: true`, which the app labels as sample
  data on screen (the files in the repo today are such samples, taken from
  the design prototype).
- All dates are UTC calendar days (`YYYY-MM-DD`); date-times are ISO 8601
  with `Z`.
- `id` matches `^[a-z0-9]+(-[a-z0-9]+)*$` and is unique; `pt` and `en` are
  both filled wherever a text exists. The schema checks both.
- Extra fields are allowed and ignored, so the pipeline can add fields before
  the app uses them.
- Polarization is **HH/HV** (NISAR L-band). Future fields use `hh` and `hv`
  in their names (e.g. `delta_hh_db`), never `vv`.

## Map layers

- Keys of `layers` come from a closed list: `flood`, `drought`,
  `fire_deforestation`, `deformation`, `soil_moisture`. Any other key fails
  validation.
- Each PNG covers **exactly the hotspot `bbox`** and is in **EPSG:3857 (Web
  Mercator)**. MapLibre places the image by its four corners and stretches
  it linearly in Web Mercator, so a PNG in lat/lon (EPSG:4326) would be
  shifted, more so on large crops. In GDAL: `gdalwarp -t_srs EPSG:3857
-te_srs EPSG:4326 -te <west> <south> <east> <north>`.
- Transparent where there is nothing to show.

## File paths inside the JSON (PNG layers)

`/dados` is cached by browsers for a year, so every file URL must change on
each deploy. The app adds the version itself; the pipeline only writes the
plain path.

- Write paths **relative to `/dados/`**: `layers/guaiba-rs/flood.png`.
  Use only letters, digits, `_`, `-`, `.` and `/`. Layer files end in
  `.png`.
- Do **not** write a leading `/`, `/dados/`, `..`, a full URL (`https://...`)
  or a query string (`?v=...`). The app rejects the file, as with any other
  contract error.
- When the app loads the JSON, it turns each path into the versioned URL:
  `layers/guaiba-rs/flood.png` → `/dados/layers/guaiba-rs/flood.png?v=a1b2c3d`
  (`a1b2c3d` = commit of the deploy). The JSON files themselves are requested
  the same way.
- Consequence: a regenerated PNG with the same name reaches users only
  through a deploy from a new commit, the same as the JSON files.

## Other files (PROPOSAL, to confirm in ADR-004)

The app already reads these files. Their schemas live in `src/shared/lib/`;
the samples in `public/dados/` show every field. Change schema, sample and
pipeline together.

### `stats/<hotspot-id>.json` — `statsSchema.ts`

Everything the panel and the technical mode show for one hotspot.

| Field           | Meaning                                                                                                                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `metadata`      | `{ "sample": true }` for hand-made data (badge on screen).                                                                                                                                         |
| `hotspot_id`    | Same `id` as in `hotspots.geojson`.                                                                                                                                                                |
| `region`        | `{pt, en}` second line under the name.                                                                                                                                                             |
| `baseline_date` | Date of the "before" image (early 2026).                                                                                                                                                           |
| `confidence`    | 0–1 or `null`.                                                                                                                                                                                     |
| `low_coherence` | `true` shows the "low-confidence result" warning.                                                                                                                                                  |
| `passes`        | `[{ date, affected_area_km2 }]`, oldest first. The timeline and the "?date=" link use these dates.                                                                                                 |
| `measured`      | "Medido": `[{ measure, value, note }]`, each `{pt, en}`. The decision-tree rules with the radar values.                                                                                            |
| `hypothesis`    | "Hipótese": `{ text, evidence, strength: "weak" \| "moderate" \| "strong" }` or `null`. Never a measurement.                                                                                       |
| `exposure`      | `[{ kind, label, value }]`; `kind` picks the icon: `people`, `homes`, `health`, `school`, `roads`, `boat`, `power`, `fire`, `drought`.                                                             |
| `sources`       | Plain names shown as chips ("NISAR GCOV", "JRC").                                                                                                                                                  |
| `scenes`        | Before/now images per sensor: keys `nisar_hh`, `nisar_hv`, `nisar_rgb`, `sentinel1`, `sentinel2`; each `{ "baseline": path, "<YYYY-MM-DD>": path }`. `{}` when there are none (the panel says so). |
| `technical`     | Technical mode, or `null` (the button is hidden). See below.                                                                                                                                       |

`technical`: `pixel_m`; `roi` (`x_pct`, `y_pct`: point of the series, % of
the image); `histogram_range_db` (`[-15, 15]`); `dates` keyed by pass date,
each with `change` (`"2"`, `"3"`, `"4"` dB → image), `classes` (transparent
PNG), `coherence`, `stats` per threshold (`decrease_pct`, `increase_pct`,
`area_km2`, `mean_db`) and `histogram` (normalized 0–1, evenly spaced over
the range); `series` (`[{ date, hh_db, hv_db }]`, baseline first);
`exposure_points` (`[{ kind: hospital | school | population, x_pct, y_pct }]`).

Image paths follow the same rules as above (relative to `/dados/`), but may
be `.webp`, `.jpg` or `.png`. Map overlays in `hotspots.geojson` stay `.png`.

### `forecast-snapshot.json` — `forecastSchema.ts`

`{ "source": "snapshot", "updated_at": ISO datetime, "forecasts": { "<id>": [{ "date", "precipitation_mm" }] } }`.
Read only when `/api/clima` cannot be reached. Cloud Scheduler should
refresh it (ADR-006).

### `enso.json` — `ensoSchema.ts`

Header badge: `{ "index": "RONI", "value_c": 2.0, "season": {pt, en},
"strength": "very_strong", "source": "NOAA CPC", "radar_through": "YYYY-MM-DD" }`.
