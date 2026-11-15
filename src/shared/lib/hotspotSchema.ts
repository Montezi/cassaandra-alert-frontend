import { z } from 'zod';
import { dataPathSchema } from './data';

/**
 * Schema for public/dados/hotspots.geojson, written by the Python pipeline.
 * Human-readable description for the pipeline: docs/data-contract.md.
 * Any change here must also change that document (and the pipeline).
 */

/** Text shown to users, in both app languages. */
export const localizedTextSchema = z.object({
  pt: z.string().min(1),
  en: z.string().min(1),
});

const longitude = z.number().min(-180).max(180);
const latitude = z.number().min(-90).max(90);

/** Classes the classifier can assign to a hotspot. */
export const DOMINANT_CLASSES = [
  'flood',
  'drought',
  'fire_deforestation',
  'deformation',
  'stable',
] as const;

/**
 * Lenses that can have a map overlay. A closed list: a misspelled key fails
 * validation instead of becoming a layer that never shows up.
 */
export const LAYER_KEYS = [
  'flood',
  'drought',
  'fire_deforestation',
  'deformation',
  'soil_moisture',
] as const;

/** A radar overlay: a .png path relative to /dados, parsed into its versioned URL. */
const layerPngSchema = z
  .string()
  .regex(/\.png$/i, 'layer must be a .png file')
  .pipe(dataPathSchema);

/** [west, south, east, north] in degrees (WGS 84). */
export const bboxSchema = z
  .tuple([longitude, latitude, longitude, latitude])
  .refine(([west, south, east, north]) => west < east && south < north, {
    message: 'bbox must be [west, south, east, north] with west < east and south < north',
  });

export const hotspotPropertiesSchema = z.object({
  /** Stable slug, also used in the URL (?hotspot=guaiba-rs). */
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be a lowercase slug'),
  name: localizedTextSchema,
  /** Optional short label for the map marker and the list ("Lago Guaíba"). */
  short_name: localizedTextSchema.optional(),
  /** Expected El Niño effect in the region (context, not a measurement). */
  enso_effect: localizedTextSchema.nullable(),
  // Measured values: null until the pipeline fills them in.
  dominant_class: z.enum(DOMINANT_CLASSES).nullable(),
  affected_area_km2: z.number().nonnegative().nullable(),
  /** Classifier confidence, from 0 to 1. */
  confidence: z.number().min(0).max(1).nullable(),
  /** Date of the latest radar pass used ("after"), YYYY-MM-DD, UTC. */
  last_pass: z.iso.date().nullable(),
  /** Date of the "before" pass the change was measured against, UTC. */
  baseline_pass: z.iso.date().nullable(),
  /** Change threshold (dB) used for affected_area_km2: 2, 3 or 4. */
  threshold_db: z.number().positive().nullable(),
  bbox: bboxSchema,
  /**
   * Lens -> PNG. Each PNG covers exactly `bbox` and is in EPSG:3857 (Web
   * Mercator), because MapLibre stretches it between the four corners. The
   * file holds a path relative to /dados/ ("layers/guaiba-rs/flood.png");
   * after parsing, the value is the versioned URL ready to use
   * ("/dados/layers/guaiba-rs/flood.png?v=a1b2c3d").
   */
  layers: z.partialRecord(z.enum(LAYER_KEYS), layerPngSchema),
});

export const hotspotSchema = z
  .object({
    type: z.literal('Feature'),
    geometry: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([longitude, latitude]),
    }),
    properties: hotspotPropertiesSchema,
  })
  .refine(
    ({
      geometry: {
        coordinates: [lon, lat],
      },
      properties: { bbox },
    }) => lon >= bbox[0] && lon <= bbox[2] && lat >= bbox[1] && lat <= bbox[3],
    { message: 'the marker point must be inside bbox', path: ['geometry', 'coordinates'] },
  );

export const hotspotCollectionSchema = z
  .object({
    type: z.literal('FeatureCollection'),
    metadata: z
      .object({
        /** `true` marks hand-made data: the app shows a "sample data" badge. */
        sample: z.boolean().optional(),
        /** `true` when the content was generated or assisted by AI (Space Apps rule). */
        ai_generated: z.boolean().optional(),
        /** Version of this contract the file follows. Current: 2. */
        schema_version: z.number().int().positive().optional(),
        /** When the pipeline wrote the file, ISO 8601 in UTC. */
        generated_at: z.iso.datetime().optional(),
      })
      .optional(),
    features: z.array(hotspotSchema),
  })
  .refine(
    ({ features }) => new Set(features.map((f) => f.properties.id)).size === features.length,
    { message: 'hotspot ids must be unique' },
  );

export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type DominantClass = (typeof DOMINANT_CLASSES)[number];
export type Hotspot = z.infer<typeof hotspotSchema>;
export type HotspotCollection = z.infer<typeof hotspotCollectionSchema>;
