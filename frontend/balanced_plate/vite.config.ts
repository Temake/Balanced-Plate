import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      // Without this the service worker and manifest are only emitted by `vite build`,
      // so `npm run dev` can never satisfy the install cnddriteria and no prompt appears.
      devOptions: {
        enabled: true,
        type: "module",
      },
      manifest: {
        id: "/",
        name: "NutriLens",
        short_name: "NutriLens",
        description: "Your AI-powered food accountability partner. Scan your meals, get real talk about what you're eating, and build better habits.",
        theme_color: "#10b981",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        // The installed app opens on the dashboard, not the marketing landing page.
        // An unauthenticated launch is bounced to /login by ProtectedRoute.
        // (This previously read "/dashbaord" — a typo, so the installed app opened
        // on the catch-all redirect instead.)
        start_url: "/dashboard",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          // Android crops icons to its own shape. This needs its own artwork rather than
          // a reuse of the one above: the green has to bleed to every edge (a transparent
          // icon gets letterboxed in a white circle) and the mark has to stay inside the
          // inner 80% safe zone so the crop never clips it.
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})