import { execSync } from 'node:child_process';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type ProxyOptions } from 'vite';

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

export default defineConfig(({ mode }) => {
  // '' loads every variable, not only VITE_*. API_PROXY_TARGET stays here in
  // Node: without the VITE_ prefix it never reaches the browser bundle.
  const env = loadEnv(mode, process.cwd(), '');

  // The app always calls relative /api/... paths. In production Firebase
  // Hosting rewrites them to Cloud Run (firebase.json); during development
  // this proxy forwards them to API_PROXY_TARGET (see .env.example).
  const apiProxy: Record<string, ProxyOptions> = {
    '/api': {
      target: env.API_PROXY_TARGET || 'http://localhost:8080',
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    define: {
      __BUILD_ID__: JSON.stringify(buildId()),
    },
    server: { proxy: apiProxy },
    preview: { proxy: apiProxy },
    build: {
      // maplibre-gl alone is ~1.1 MB minified (~290 kB gzip) and already loads
      // in its own lazy chunk; warn only above that.
      chunkSizeWarningLimit: 1100,
    },
  };
});
