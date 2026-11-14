import { useCallback, useEffect, useState } from 'react';
import type { z } from 'zod';
import { fetchData } from './data';

/**
 * Loads a /dados file once per page view and shares it between components:
 * the panel, the chat and the alert all read stats/<id>.json, but the browser
 * downloads it only once.
 */
const cache = new Map<string, Promise<unknown>>();

export function loadData<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  let promise = cache.get(path) as Promise<T> | undefined;
  if (!promise) {
    promise = fetchData(path, schema);
    // A failed request must not stay cached: "Try again" has to download again.
    promise.catch(() => cache.delete(path));
    cache.set(path, promise);
  }
  return promise;
}

export type DataState<T> =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T };

type Result<T> = { path: string; state: DataState<T> };

/** React state for one /dados file. `path` null means "nothing to load". */
export function useData<T>(
  path: string | null,
  schema: z.ZodType<T>,
): { state: DataState<T>; retry: () => void } {
  const [result, setResult] = useState<Result<T> | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (path === null) return;
    let current = true;
    loadData(path, schema)
      .then((data) => {
        if (current) setResult({ path, state: { status: 'ready', data } });
      })
      .catch((error: unknown) => {
        console.error(error); // Lists the fields that broke the data contract.
        if (current) setResult({ path, state: { status: 'error' } });
      });
    return () => {
      current = false;
    };
  }, [path, schema, attempt]);

  const retry = useCallback(() => {
    setResult(null);
    setAttempt((n) => n + 1);
  }, []);

  // A result for another path (the user picked a new hotspot) means "loading".
  const state: DataState<T> =
    path === null || result === null || result.path !== path ? { status: 'loading' } : result.state;
  return { state, retry };
}
