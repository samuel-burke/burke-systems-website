/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-utils/setup.ts"],
    // Playwright owns tests/ (integration and E2E); Vitest runs the unit tests next to the code.
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      // The logic that unit tests can reach: form parsing, helpers and the Pages Functions.
      // Pages and sections are .astro templates, checked by the E2E suite instead.
      // src/components/ui is vendored shadcn source; brand paths and pricing are static data.
      include: ["src/lib/**/*.ts", "functions/**/*.ts"],
      exclude: ["**/*.test.ts"],
      reporter: ["text", "json-summary", "lcov"],
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 85 },
    },
  },
});
