import { z } from 'zod';
import { localizedTextSchema } from './hotspotSchema';

/** Schema for public/dados/enso.json: the El Niño badge in the app header. */
export const ensoSchema = z.object({
  index: z.literal('RONI'),
  /** Relative Oceanic Niño Index, °C. */
  value_c: z.number(),
  season: localizedTextSchema,
  strength: z.enum(['neutral', 'weak', 'moderate', 'strong', 'very_strong']),
  source: z.string(),
  /** Latest radar pass processed by the pipeline. */
  radar_through: z.iso.date(),
});

export type Enso = z.infer<typeof ensoSchema>;
