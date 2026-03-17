import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  const env = process.env;
  const hasApiBaseUrl = Boolean(env.VITE_API_BASE_URL);
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8081';

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.js'
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      hmr: {
        clientPort: 3000,
        host: 'localhost'
      },
      watch: {
        usePolling: true,
        interval: 100
      },
      // When no explicit API base URL is set, proxy /api to the backend in dev.
      ...(hasApiBaseUrl
        ? {}
        : {
            proxy: {
              '/api': {
                target: apiProxyTarget,
                changeOrigin: true
              },
              '/uploads': {
                target: apiProxyTarget,
                changeOrigin: true
              }
            }
          })
    },
    build: {
      sourcemap: true
    }
  };
});
