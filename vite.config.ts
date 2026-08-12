import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/v1/schemes': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/master': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/reports': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/attendance': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/v1': {
        target: 'http://localhost:8091',
        changeOrigin: true,
      },
    },
  },
});
