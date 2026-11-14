import { z } from 'zod';
import { dataPathSchema } from './data';
import { localizedTextSchema } from './hotspotSchema';

/**
 * Schema for public/dados/stats/<hotspot-id>.json: everything the panel and
 * the technical mode show about one hotspot. PROPOSAL for ADR-004; described
 * for the pipeline in docs/data-contract.md. Change both together.
 */

const isoDate = z.iso.date();

/** A file under /dados (image), parsed into its versioned URL. */
const filePath = dataPathSchema;

export const HYPOTHESIS_STRENGTHS = ['weak', 'moderate', 'strong'] as const;

export const EXPOSURE_KINDS = [
  'people',
  'homes',
  'health',
  'school',
  'roads',
  'boat',
  'power',
  'fire',
  'drought',
] as const;

export const SCENE_KEYS = ['nisar_hh', 'nisar_hv', 'nisar_rgb', 'sentinel1', 'sentinel2'] as const;

/** Images of one sensor/polarization: "baseline" plus one entry per pass date. */
const sceneSchema = z
  .object({ baseline: filePath })
  .catchall(filePath)
  .superRefine((scene, ctx) => {
    for (const key of Object.keys(scene)) {
      if (key !== 'baseline' && !isoDate.safeParse(key).success) {
        ctx.addIssue({ code: 'custom', message: `scene key "${key}" must be a YYYY-MM-DD date` });
      }
    }
  });

const thresholdKey = z.enum(['2', '3', '4']);

const changeStatsSchema = z.object({
  /** Share of pixels where the signal fell more than the threshold, in %. */
  decrease_pct: z.number().min(0).max(100),
  increase_pct: z.number().min(0).max(100),
  area_km2: z.number().nonnegative(),
  mean_db: z.number(),
});

const technicalDateSchema = z.object({
  /** Change map (Δ dB) per threshold in dB. */
  change: z.record(thresholdKey, filePath),
  /** Classes overlay (transparent PNG). */
  classes: filePath,
  coherence: filePath,
  stats: z.record(thresholdKey, changeStatsSchema),
  /** Histogram of Δ, normalized 0–1, evenly spaced over histogram_range_db. */
  histogram: z.array(z.number().min(0).max(1)).min(2),
});

export const technicalSchema = z.object({
  pixel_m: z.number().positive(),
  /** Point of interest for the series, in % of the image width and height. */
  roi: z.object({ x_pct: z.number().min(0).max(100), y_pct: z.number().min(0).max(100) }),
  histogram_range_db: z.tuple([z.number(), z.number()]),
  dates: z.record(isoDate, technicalDateSchema),
  series: z.array(z.object({ date: isoDate, hh_db: z.number(), hv_db: z.number() })).min(2),
  exposure_points: z.array(
    z.object({
      kind: z.enum(['hospital', 'school', 'population']),
      x_pct: z.number().min(0).max(100),
      y_pct: z.number().min(0).max(100),
    }),
  ),
});

export const hotspotStatsSchema = z.object({
  metadata: z.object({ sample: z.boolean().optional() }).optional(),
  hotspot_id: z.string(),
  region: localizedTextSchema,
  /** Date of the "before" image (early 2026). */
  baseline_date: isoDate,
  confidence: z.number().min(0).max(1).nullable(),
  /** True when coherence between passes is too low to trust the result. */
  low_coherence: z.boolean(),
  /** One entry per radar pass, oldest first. */
  passes: z.array(z.object({ date: isoDate, affected_area_km2: z.number().nonnegative() })).min(1),
  /** "Medido": the decision-tree rules with the radar values. */
  measured: z.array(
    z.object({
      measure: localizedTextSchema,
      value: localizedTextSchema,
      note: localizedTextSchema,
    }),
  ),
  /** "Hipótese": possible explanation, never presented as measured. */
  hypothesis: z
    .object({
      text: localizedTextSchema,
      evidence: localizedTextSchema,
      strength: z.enum(HYPOTHESIS_STRENGTHS),
    })
    .nullable(),
  exposure: z.array(
    z.object({
      kind: z.enum(EXPOSURE_KINDS),
      label: localizedTextSchema,
      value: localizedTextSchema,
    }),
  ),
  sources: z.array(z.string().min(1)),
  scenes: z.partialRecord(z.enum(SCENE_KEYS), sceneSchema),
  technical: technicalSchema.nullable(),
});

export type HotspotStats = z.infer<typeof hotspotStatsSchema>;
export type SceneKey = (typeof SCENE_KEYS)[number];
export type ExposureKind = (typeof EXPOSURE_KINDS)[number];
export type HypothesisStrength = (typeof HYPOTHESIS_STRENGTHS)[number];
export type Technical = z.infer<typeof technicalSchema>;
