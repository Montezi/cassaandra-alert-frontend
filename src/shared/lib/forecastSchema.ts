import { z } from 'zod';

/**
 * Rain forecast. /api/clima answers with `forecastResponseSchema`
 * (Meteomatics → Open-Meteo → saved snapshot, ADR-006). If the API cannot be
 * reached at all, the app reads /dados/forecast-snapshot.json instead.
 */

export const FORECAST_SOURCES = ['meteomatics', 'open-meteo', 'snapshot'] as const;

const forecastDaySchema = z.object({
  date: z.iso.date(),
  precipitation_mm: z.number().nonnegative(),
});

export const forecastResponseSchema = z.object({
  source: z.enum(FORECAST_SOURCES),
  updated_at: z.iso.datetime(),
  /** Bounded so a broken server cannot hand the chart thousands of bars. */
  days: z.array(forecastDaySchema).min(1).max(16),
});

export const forecastSnapshotSchema = z.object({
  metadata: z
    .object({ sample: z.boolean().optional(), ai_generated: z.boolean().optional() })
    .optional(),
  source: z.literal('snapshot'),
  updated_at: z.iso.datetime(),
  forecasts: z.record(z.string(), z.array(forecastDaySchema).min(1)),
});

export type ForecastSource = (typeof FORECAST_SOURCES)[number];
export type Forecast = z.infer<typeof forecastResponseSchema> & { sample: boolean };
