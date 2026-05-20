import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['crevia-logo.png', 'robots.txt'],
      manifest: {
        name: 'Crevia - Own Your Story',
        short_name: 'Crevia',
        description: 'Empowering creators to own their digital careers',
        theme_color: '#CD9C5C',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: '/crevia-logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/crevia-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // New SW waits until the user taps "Update" in the UpdateBanner.
        // This prevents chunk-URL mismatches: the old SW keeps serving the current
        // session's chunks; the new SW only takes over on a clean page reload.
        skipWaiting: false,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          // Always fetch the HTML shell from the network so users immediately
          // get the latest index.html (with correct chunk hashes) on every
          // navigation, falling back to cache only when offline.
          {
            urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
            handler: 'NetworkFirst' as const,
            options: {
              cacheName: 'navigation-cache',
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst' as const,
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
        ],
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('recharts') || id.includes('d3-'))          return 'vendor-charts';
          if (id.includes('html2canvas') || id.includes('jspdf'))     return 'vendor-pdf';
          if (id.includes('framer-motion'))                            return 'vendor-motion';
          if (id.includes('@supabase'))                                return 'vendor-supabase';
          if (id.includes('@tanstack'))                                return 'vendor-query';
          if (id.includes('@radix-ui'))                                return 'vendor-ui';
          if (id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
