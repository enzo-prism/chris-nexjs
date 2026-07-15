import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

/**
 * (D) First-visit conversion chrome.
 *
 * - The analytics consent pop-up has been removed entirely (it hurt UX), so it
 *   must NOT appear on a fresh (no-storage) visit and must never cover the
 *   MobileActionBar Call / Request Visit buttons.
 * - The skip-to-content link remains visually hidden until keyboard focus,
 *   then becomes visible so keyboard users can bypass repeated navigation.
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

test("skip-to-content link appears only when focused", async ({ page }) => {
  await gotoAndHydrate(page, "/");

  const skipLink = page.locator('[data-testid="skip-to-content"]');
  await expect(skipLink).toHaveCount(1);
  const hiddenBox = await skipLink.boundingBox();
  expect((hiddenBox?.y ?? 0) + (hiddenBox?.height ?? 0)).toBeLessThanOrEqual(0);
  await skipLink.focus();
  await expect(skipLink).toBeVisible();
  await expect
    .poll(async () => (await skipLink.boundingBox())?.y ?? -1)
    .toBeGreaterThanOrEqual(0);
  const focusedBox = await skipLink.boundingBox();
  expect(focusedBox?.width).toBeGreaterThan(1);
  await expect(skipLink).toHaveAttribute("href", "#main-content");
  await expect(page.locator("main#main-content")).toHaveCount(1);
});
