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
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        start_url: '/',
        scope: '/',
        launch_handler: { client_mode: 'navigate-existing' },
        icons: [
          { src: '/crevia-logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/crevia-logo.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/crevia-logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/crevia-logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ]
      },
      workbox: {
        // autoUpdate + skipWaiting: the new SW installs and immediately takes
        // control of all pages. Chunk-URL mismatch risk is negligible because:
        //   1. HTML is NetworkFirst — fresh index.html always has correct hashes.
        //   2. JS/CSS chunks are content-hashed — old URLs remain in cache for
        //      any in-flight requests while the new SW activates.
        // ReloadPrompt.tsx fires window.location.reload() after controllerchange
        // so users always land on a coherent new bundle.
        skipWaiting: true,
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
            // Auth & storage endpoints — always fresh (security sensitive)
            urlPattern: /^https:\/\/.*\.supabase\.co\/(auth|storage)\/.*/i,
            handler: 'NetworkFirst' as const,
            options: {
              cacheName: 'supabase-auth-cache',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 },
            },
          },
          {
            // REST read data — serve stale instantly, revalidate in background.
            // Returning users see their profile/conversations with zero delay.
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: 'StaleWhileRevalidate' as const,
            options: {
              cacheName: 'supabase-rest-cache',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            // JS/CSS chunks — cache-first: content-hashed filenames mean a new
            // deploy always produces new URLs, so serving stale chunks is safe.
            // Returning users load the app from disk with zero network round-trips.
            urlPattern: /\.(?:js|css)$/i,
            handler: 'CacheFirst' as const,
            options: {
              cacheName: 'static-assets-cache',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      }
    })
  ],
  optimizeDeps: {
    // @ffmpeg packages are ES modules with top-level await — Vite must not pre-bundle them.
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
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
          if (id.includes('lucide-react'))                             return 'vendor-icons';
          if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) return 'vendor-react';
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
