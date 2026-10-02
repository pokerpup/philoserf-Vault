import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Phase 0 defaults (DECISIONS.md): client 3000, server 3001; /api is proxied so the browser sees one origin.
export default defineConfig({
  plugins: [react()],
  // GUARDRAILS: the game never reads .env* files; Vite would otherwise load them from this folder.
  envDir: false,
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://127.0.0.1:3001', changeOrigin: false },
    },
  },
  build: { target: 'es2022' },
});
