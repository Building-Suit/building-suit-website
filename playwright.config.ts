import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"], ["html", { outputFolder: "test-results/html-report", open: "never" }]],
  outputDir: "test-results/artifacts",
  use: {
    baseURL: "http://localhost:3412",
    trace: "retain-on-failure",
    launchOptions: { executablePath: "/opt/pw-browsers/chromium" },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node .output/server/index.mjs",
    url: "http://localhost:3412",
    reuseExistingServer: false,
    timeout: 60_000,
    env: { PORT: "3412", NITRO_PORT: "3412" },
  },
});
