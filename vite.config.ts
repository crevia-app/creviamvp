import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    // Copy FFmpeg WASM from node_modules to public/ffmpeg/ so the files are
    // served from the same origin instead of an external CDN.
    {
      name: 'copy-ffmpeg-wasm',
      buildStart() {
        const src = 'node_modules/@ffmpeg/core/dist/esm';
        const dest = 'public/ffmpeg';
        fs.mkdirSync(dest, { recursive: true });
        for (const file of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) {
          fs.copyFileSync(`${src}/${file}`, `${dest}/${file}`);
        }
      },
    },
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
        // skipWaiting: new SW calls self.skipWaiting() immediately during install,
        // so it never sits in "waiting" state. Combined with clientsClaim it takes
        // over all open tabs the moment it activates, firing controllerchange on
        // every client so AutoUpdate.tsx can trigger a silent reload.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Exclude FFmpeg WASM from precache — it's 32 MB and handled by runtimeCaching below.
        globIgnores: ['**\/ffmpeg\/**'],
        runtimeCaching: [
          // Navigation (HTML shell) — NetworkFirst with a tight timeout.
          // On every route navigation the browser tries the network first.
          // If the server returns a new index.html (new deploy), the SW caches it
          // so the next cold open on iOS also gets the latest shell.
          // 3 s timeout: fast enough for good UX, generous enough for slow mobile.
          {
            urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
            handler: 'NetworkFirst' as const,
            options: {
              cacheName: 'navigation-cache',
              networkTimeoutSeconds: 3,
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
            // REST read data — stale-while-revalidate: instant load, fresh data
            // in the background. Returning users see content with zero wait.
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: 'StaleWhileRevalidate' as const,
            options: {
              cacheName: 'supabase-rest-cache',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            // FFmpeg WASM — CacheFirst with a 1-year TTL. The files are served
            // from our own origin so the first fetch is reliable, and every
            // subsequent video conversion on that device is instant (from SW cache).
            urlPattern: /\/ffmpeg\/.*/,
            handler: 'CacheFirst' as const,
            options: {
              cacheName: 'ffmpeg-wasm-cache',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // JS/CSS chunks — CacheFirst: content-hashed filenames guarantee a
            // new deploy produces new URLs, so a cached chunk is never stale.
            // Cold opens load from disk with zero network round-trips.
            urlPattern: /\.(?:js|css)$/i,
            handler: 'CacheFirst' as const,
            options: {
              cacheName: 'static-assets-cache',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Fonts and images — CacheFirst with a 90-day TTL.
            urlPattern: /\.(?:woff2?|ttf|eot|png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst' as const,
            options: {
              cacheName: 'assets-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 90 },
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
