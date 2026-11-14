import { execSync } from 'node:child_process';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Short commit hash used as the cache-busting version for /dados files
 * (`/dados/hotspots.geojson?v=<commit>`). CI provides GITHUB_SHA; locally we
 * ask git; without any commit we fall back to "dev".
 */
function buildId(): string {
  const sha = process.env.GITHUB_SHA;
  if (sha) return sha.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'dev';
  }
}

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_ID__: JSON.stringify(buildId()),
  },
  build: {
    // maplibre-gl alone is ~1.1 MB minified (~290 kB gzip) and already loads
    // in its own lazy chunk; warn only above that.
    chunkSizeWarningLimit: 1100,
  },
});
