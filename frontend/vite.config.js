import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// ─── Constants ───────────────────────────────────────────────────────────────

const PWA_ICONS = [
  { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
  { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
  { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
];

const CACHE_MAX_AGE = {
  ONE_DAY: 60 * 60 * 24,
  ONE_YEAR: 60 * 60 * 24 * 365,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const silentProxyErrors = new Set(['ECONNABORTED', 'ECONNRESET', 'EPIPE']);

function makeProxy(target, opts = {}) {
  return {
    target,
    changeOrigin: true,
    ...opts,
    configure(proxy, label = 'proxy') {
      proxy.on('error', (err) => {
        if (silentProxyErrors.has(err.code)) return;
        console.error(`[${label} error]`, err.message);
      });
    },
  };
}

function buildRuntimeCache(urlPattern, handler, cacheName, maxEntries, maxAgeSeconds) {
  return {
    urlPattern,
    handler,
    options: {
      cacheName,
      expiration: { maxEntries, maxAgeSeconds },
      cacheableResponse: { statuses: [0, 200] },
    },
  };
}

// ─── Config ──────────────────────────────────────────────────────────────────

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const hasApiBaseUrl = Boolean(env.VITE_API_BASE_URL);
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080';

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'University Hostel Management System',
          short_name: 'HostelMS',
          description: 'Manage your hostel bookings, payments, and applications',
          theme_color: '#2563eb',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          icons: PWA_ICONS,
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            buildRuntimeCache(/^https:\/\/api\.*/i,                      'NetworkFirst', 'api-cache',           100, CACHE_MAX_AGE.ONE_DAY),
            buildRuntimeCache(/^https:\/\/fonts\.googleapis\.com\/.*/i,  'CacheFirst',   'google-fonts-cache',   10, CACHE_MAX_AGE.ONE_YEAR),
            buildRuntimeCache(/^https:\/\/fonts\.gstatic\.com\/.*/i,     'CacheFirst',   'gstatic-fonts-cache',  10, CACHE_MAX_AGE.ONE_YEAR),
          ],
        },
      }),
    ],

    define: {
      global: 'globalThis',
      'import.meta.env.VITE_API_PROXY_TARGET': JSON.stringify(apiProxyTarget),
    },

    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.js',
    },

    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3000,
        clientPort: 3000,
      },
      watch: {
        usePolling: true,
        interval: 100,
      },
      ...(!hasApiBaseUrl && {
        proxy: {
          '/api':              makeProxy(apiProxyTarget),
          '/uploads':          makeProxy(apiProxyTarget),
          '/ws-notifications': makeProxy(apiProxyTarget, { ws: true }),
        },
      }),
    },

    build: {
      sourcemap: true,
    },
  };
});