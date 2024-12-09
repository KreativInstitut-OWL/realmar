import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/aframe/dist/aframe-master.min.js",
          dest: "js",
        },
        {
          src: "node_modules/mind-ar/dist/mindar-image-aframe.prod.js",
          dest: "js",
        },
      ],
    }),
  ],
  server: {
    host: true,
    port: 8000,
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/setup.ts",
  },
});
