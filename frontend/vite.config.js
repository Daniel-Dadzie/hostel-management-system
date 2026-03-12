import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
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
    }
  },
  build: {
    sourcemap: true
  }
});
