import { defineConfig, devices } from "@playwright/test";

const PORT = 3212;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/invisalign-media",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  timeout: 90_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "invisalign-media-chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: {
    command: `pnpm exec next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      NODE_ENV: "development",
    },
  },
});
