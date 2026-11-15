import { z } from 'zod';

/**
 * Zod 4 compiles object parsers with `new Function` for speed. To the
 * Content-Security-Policy in firebase.json that is `eval`, so it is turned
 * off here: validation still runs, through the interpreted path. Zod reads
 * this flag when a schema is constructed, so this module must be evaluated
 * before any schema module: it is the first import in src/main.tsx.
 */
z.config({ jitless: true });
