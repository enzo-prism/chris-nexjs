import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

/**
 * (D) First-visit conversion chrome.
 *
 * - The analytics consent pop-up has been removed entirely (it hurt UX), so it
 *   must NOT appear on a fresh (no-storage) visit and must never cover the
 *   MobileActionBar Call / Request Visit buttons.
 * - The skip-to-content link must exist and become visible when focused.
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

test("skip-to-content link exists and becomes visible on focus", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/");

  const skip = page.locator('[data-testid="skip-to-content"]');
  await expect(skip).toHaveCount(1);

  // It is visually hidden (sr-only) until focused.
  await skip.focus();

  const box = await skip.boundingBox();
  expect(box, "focused skip link has no bounding box (still hidden)").not.toBeNull();

  // Must be inside the viewport once focused.
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  expect(box!.width, "focused skip link has zero width").toBeGreaterThan(0);
  expect(box!.height, "focused skip link has zero height").toBeGreaterThan(0);
  expect(
    box!.y,
    `focused skip link is offscreen (y=${Math.round(box!.y)})`,
  ).toBeGreaterThanOrEqual(0);
  expect(
    box!.y,
    `focused skip link is below the fold (y=${Math.round(box!.y)}, viewport h=${viewport!.height})`,
  ).toBeLessThan(viewport!.height);
});
