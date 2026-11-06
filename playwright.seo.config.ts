import { defineConfig } from "@playwright/test";

// Explicit running production build: no second build, no live form traffic.
export default defineConfig({
  testDir: "./tests/seo",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  timeout: 45_000,
  reporter: "list",
  use: {
    baseURL: process.env.SEO_AUDIT_BASE_URL || "http://127.0.0.1:3240",
    channel: process.env.CI ? undefined : "chrome",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "phone", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
