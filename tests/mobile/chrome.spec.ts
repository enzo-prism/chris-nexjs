import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

/**
 * (D) First-visit conversion chrome.
 *
 * - The analytics consent banner appears on a fresh (no-storage) visit and must
 *   sit ABOVE the fixed MobileActionBar so the Call / Request Visit buttons are
 *   never covered on first load.
 * - The skip-to-content link must exist and become visible when focused.
 *
 * These tests use a fresh context (Playwright gives each test an isolated
 * context by default, so localStorage starts empty and the banner shows).
 */

test("consent banner does not overlap the MobileActionBar", async ({ page }) => {
  await gotoAndHydrate(page, "/");

  const consent = page.locator('[data-testid="consent-banner"]');
  const actionBar = page.locator('[data-testid="mobile-action-bar"]');

  await expect(consent).toBeVisible({ timeout: 20_000 });
  await expect(actionBar).toBeVisible({ timeout: 20_000 });

  const consentBox = await consent.boundingBox();
  const actionBarBox = await actionBar.boundingBox();
  expect(consentBox, "consent banner has no bounding box").not.toBeNull();
  expect(actionBarBox, "action bar has no bounding box").not.toBeNull();

  const consentBottom = consentBox!.y + consentBox!.height;
  const actionBarTop = actionBarBox!.y;

  expect(
    consentBottom,
    `Consent banner overlaps the MobileActionBar.\n` +
      `  consent: y=${Math.round(consentBox!.y)} h=${Math.round(consentBox!.height)} bottom=${Math.round(consentBottom)}\n` +
      `  actionBar: y=${Math.round(actionBarTop)} h=${Math.round(actionBarBox!.height)}`,
    // small tolerance for sub-pixel rounding
  ).toBeLessThanOrEqual(actionBarTop + 2);
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
