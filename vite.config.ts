/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // React + roteador + formulários + Supabase dão ~235 KB comprimidos; os gráficos ficam à parte.
  build: { chunkSizeWarningLimit: 850 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
