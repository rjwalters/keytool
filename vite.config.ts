import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  base: process.env.NODE_ENV === "production" ? "./" : "/",
  build: {
    outDir: "build",
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: "es",
        entryFileNames: "_app/immutable/[name].[hash].js",
        chunkFileNames: "_app/immutable/chunks/[name].[hash].js",
        assetFileNames: "_app/immutable/assets/[name].[hash][extname]",
      },
    },
  },
  server: {
    port: 5173,
  },
});
