import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': root },
  },
  server: {
    // Saat `npm run dev`, teruskan /api/* ke backend Express (npm run server)
    proxy: { '/api': `http://localhost:${process.env.API_PORT || 5000}` },
  },
});
