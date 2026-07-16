import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { ViteMcp } from 'vite-plugin-mcp'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Inlines the widget's CSS into the JS bundle at build time, so Repo 2
    // only has to embed a single <script> tag when registering this as an
    // MCP Apps UI resource. Has no effect on the `vite dev` server.
    cssInjectedByJsPlugin(),
    // Dev-only: exposes this Vite app's module graph/state to Cursor at
    // http://localhost:5173/__mcp/sse. Unrelated to the ChatGPT-facing MCP
    // server in Repo 2 — this never ships in the widget bundle.
    ViteMcp(),
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/main.tsx', import.meta.url)),
      name: 'PricingEstimatorWidget',
      formats: ['es'],
      fileName: () => 'pricing-widget.js',
    },
    rollupOptions: {
      // Bundle React, TanStack Query, Zustand, etc. into the single output
      // file instead of externalizing them — Repo 2 embeds this as a
      // self-contained <script type="module"> with nothing else to resolve.
      output: {
        codeSplitting: false,
      },
    },
  },
})
