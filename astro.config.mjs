// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  // Link previews and canonical URLs are built from this.
  site: "https://burke.systems",

  prefetch: {
    // 'viewport' is quite an aggressive strategy.  'hover' could suffice, but we need to experiment.
    defaultStrategy: "viewport",
    prefetchAll: true,
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
