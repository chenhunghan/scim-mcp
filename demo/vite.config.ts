import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    host: true,
  },
  preview: {
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});