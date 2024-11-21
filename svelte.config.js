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
      strict: false,
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

    paths: {
      base: '',
      assets:'',
    },
    prerender: {
      handleMissingId: "ignore",
      entries: ["/"],
    },
    appDir: "_app",
    files: {
      assets: "static",
      routes: "src/routes",
    },
    version: {
      name: Date.now().toString(),
    },
  },
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: true,
  },
};

export default config;
