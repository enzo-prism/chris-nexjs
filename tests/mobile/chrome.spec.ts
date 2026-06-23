import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

/**
 * (D) First-visit conversion chrome.
 *
 * - The analytics consent pop-up has been removed entirely (it hurt UX), so it
 *   must NOT appear on a fresh (no-storage) visit and must never cover the
 *   MobileActionBar Call / Request Visit buttons.
 * - The skip-to-content link has been removed from the design (it flashed into
 *   the top-left on SPA navigations) and must never reappear.
 *
 * These tests use a fresh context (Playwright gives each test an isolated
 * context by default, so localStorage starts empty — the old banner would have
 * shown here).
 */

test("analytics consent pop-up is gone (does not appear on a fresh visit)", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/");

  // Give any deferred client chrome time to mount, then assert no banner.
  const actionBar = page.locator('[data-testid="mobile-action-bar"]');
  await expect(actionBar).toBeVisible({ timeout: 20_000 });

  await expect(page.locator('[data-testid="consent-banner"]')).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /accept analytics/i }),
  ).toHaveCount(0);
});

test("skip-to-content link is removed from the design", async ({ page }) => {
  await gotoAndHydrate(page, "/");

  await expect(page.locator('[data-testid="skip-to-content"]')).toHaveCount(0);
  await expect(page.locator('a[href="#main-content"]')).toHaveCount(0);
  await expect(
    page.getByText("Skip to main content", { exact: false }),
  ).toHaveCount(0);
});
