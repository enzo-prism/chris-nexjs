import { defineConfig, devices } from "@playwright/test";

const remoteBase = process.env.PLAYWRIGHT_BASE_URL?.trim() ?? "";
const PORT = 3212;
const localBase = `http://localhost:${PORT}`;
const baseURL = remoteBase || localBase;

export default defineConfig({
  testDir: "./tests/sms",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  timeout: 180_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "sms-390",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "sms-1440",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: remoteBase
    ? undefined
    : {
        command: `pnpm run build && pnpm exec next start -p ${PORT}`,
        url: localBase,
        reuseExistingServer: true,
        timeout: 240_000,
        stdout: "pipe",
        stderr: "pipe",
      },
});
