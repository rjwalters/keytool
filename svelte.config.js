import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "index.html",
      precompress: false,
      strict: true,
    }),

    alias: {
      $lib: "src/lib",
      "$lib/*": "src/lib/*",
      "$components/*": "src/lib/components/*",
      "$stores/*": "src/lib/stores/*",
      "$utils/*": "src/lib/utils/*",
      "$api/*": "src/lib/api/*",
      $components: "src/lib/components",
      $stores: "src/lib/stores",
      $utils: "src/lib/utils",
      $api: "src/lib/api",
    },
  },
  preprocess: [{ postcss: true }, vitePreprocess()],
  prerender: {
    default: true,
    handleMissingId: "ignore",
  },
  version: {
    name: Date.now().toString(),
  },
  compilerOptions: {
    runes: true,
  },
};

export default config;
