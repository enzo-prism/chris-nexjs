import { defineConfig, devices } from "@playwright/test";

/**
 * Mobile end-to-end suite that verifies a batch of mobile-UX fixes actually
 * render correctly on a phone-sized viewport.
 *
 * The site is a wouter SPA hydrated inside the Next.js App Router, so every
 * spec navigates with `page.goto` and then waits for the relevant element to
 * become visible (hydration) before asserting.
 *
 * We drive the system Google Chrome via `channel: "chrome"` so we do not need
 * to download Playwright's full bundled browser set. The iPhone device
 * descriptor defaults to WebKit, so we explicitly override
 * `defaultBrowserType` to `chromium` and drop the WebKit-only user agent that
 * would otherwise be ignored by Chrome.
 */
const PORT = 3210;
const BASE_URL = `http://localhost:${PORT}`;

const iphone = devices["iPhone 13"];

export default defineConfig({
  testDir: "./tests/mobile",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  timeout: 60_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "mobile-chrome",
      use: {
        ...iphone,
        // The iPhone descriptor sets defaultBrowserType to "webkit"; force
        // chromium so the `channel: "chrome"` launch is honored.
        defaultBrowserType: "chromium",
        channel: "chrome",
        // The WebKit Safari UA from the descriptor is meaningless under
        // Chrome; let Chrome supply its own UA while we keep the mobile
        // viewport / touch / device-scale-factor that matter for the tests.
        userAgent: undefined,
      },
    },
  ],

  webServer: {
    // Build, then start Next on the test port. We invoke `next start` directly
    // (via pnpm exec) rather than `pnpm run start -- -p` because the extra `--`
    // is passed through to `next start` as a positional dir argument, which it
    // rejects ("Invalid project directory ... /-p").
    command: `pnpm run build && pnpm exec next start -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 240_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
