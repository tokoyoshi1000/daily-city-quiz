import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Daily City Quiz",
        short_name: "City Quiz",
        description:
          "Errate jeden Tag eine Stadt — 6 Hinweise, Distanz-Feedback und ein Bonus-Quiz.",
        lang: "de",
        start_url: ".",
        scope: ".",
        display: "standalone",
        background_color: "#131519",
        theme_color: "#131519",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // App-Shell precachen; og.png nur fürs Teilen (offline unnötig).
        // data/*.json ist bewusst NICHT im Precache: ein Daily-Game darf nie
        // ein altes Tagesrätsel aus dem Cache festhalten → NetworkFirst unten.
        globPatterns: ["**/*.{js,css,html,woff2,woff,png}"],
        globIgnores: ["og.png"],
        runtimeCaching: [
          {
            urlPattern: /\/data\/.+\.json$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "dcq-data",
              networkTimeoutSeconds: 4,
            },
          },
        ],
      },
    }),
  ],
});
