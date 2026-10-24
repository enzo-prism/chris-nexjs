import { defineConfig, devices } from "@playwright/test";

const remoteBase =
  process.env.PLAYWRIGHT_BASE_URL?.trim() ||
  process.env.SEO_AUDIT_BASE_URL?.trim() ||
  "";

const PORT = 3211;
const localBase = `http://localhost:${PORT}`;
const baseURL = remoteBase || localBase;

export default defineConfig({
  testDir: "./tests/analytics",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "on",
  },
  projects: [
    {
      name: "analytics-chromium",
      use: {
        ...devices["Desktop Chrome"],
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
