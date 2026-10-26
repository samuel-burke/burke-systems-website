import { defineConfig, devices } from "@playwright/test";

// PLAYWRIGHT_BASE_URL points the read-only smoke tests at a deployed site (a preview or production).
// Without it, Playwright starts the built site locally with Wrangler and a throwaway D1 database.
const remote = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "tests",
  // One worker: the tests share one local database and one alert receiver port.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: remote ?? "http://127.0.0.1:8788",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "integration", testDir: "tests/integration" },
    {
      name: "e2e",
      testDir: "tests/e2e",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "e2e-mobile",
      testDir: "tests/e2e",
      grep: /@mobile/,
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: remote
    ? undefined
    : {
        command: "node tests/support/start-server.ts",
        url: "http://127.0.0.1:8788/",
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
