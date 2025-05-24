import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Hash Hunter',
        short_name: 'Hash Hunter',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0f172a',
        description: 'Jogo Hash Hunter',
        icons: [
          {
            src: '/assets/images/placeholder.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
