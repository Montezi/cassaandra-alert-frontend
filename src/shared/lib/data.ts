import { z } from 'zod';

/**
 * URL of a pipeline file under /dados, versioned with the build's commit.
 * /dados is cached for a year (firebase.json), so each deploy needs a new
 * URL to make browsers fetch the new files: /dados/hotspots.geojson?v=a1b2c3d
 */
export function dataUrl(path: string): string {
  return `/dados/${path}?v=${encodeURIComponent(__BUILD_ID__)}`;
}

/**
 * A file that a /dados JSON points to (e.g. a layer PNG), written by the
 * pipeline as a path relative to /dados: "layers/guaiba-rs/flood.png".
 * Parsing turns it into the versioned URL the app must use:
 * "/dados/layers/guaiba-rs/flood.png?v=a1b2c3d". Code that reads parsed data
 * therefore never builds an unversioned /dados URL by hand.
 */
export const dataPathSchema = z
  .string()
  .regex(
    // Letters, digits, "_", "-", "." and "/" only: no leading "/", no "..",
    // no "http://", no "?" or "#".
    /^(?!.*\.\.)[\w.-]+(\/[\w.-]+)*$/,
    'must be a path relative to /dados, like "layers/guaiba-rs/flood.png"',
  )
  .transform((path) => dataUrl(path));

/** Fetches a /dados file and validates it. Throws if the request or validation fails. */
export async function fetchData<T>(
  path: string,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(dataUrl(path), { signal });
  if (!response.ok) {
    throw new Error(`GET /dados/${path} failed with HTTP ${response.status}`);
  }
  const json: unknown = await response.json();
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new Error(
      `/dados/${path} does not match the data contract:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
