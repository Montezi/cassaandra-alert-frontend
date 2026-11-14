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
  /** Date of the latest radar pass used, YYYY-MM-DD. */
  last_pass: z.iso.date().nullable(),
  bbox: bboxSchema,
  /**
   * Lens name -> PNG. The file holds a path relative to /dados/
   * ("layers/guaiba-rs/flood.png"); after parsing, the value is the versioned
   * URL ready to use ("/dados/layers/guaiba-rs/flood.png?v=a1b2c3d").
   */
  layers: z.record(z.string(), layerPngSchema),
});

export const hotspotSchema = z.object({
  type: z.literal('Feature'),
  geometry: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([longitude, latitude]),
  }),
  properties: hotspotPropertiesSchema,
});

export const hotspotCollectionSchema = z
  .object({
    type: z.literal('FeatureCollection'),
    /** Optional. `sample: true` marks hand-made data with approximate positions. */
    metadata: z.object({ sample: z.boolean().optional() }).optional(),
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
