import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

/**
 * (B) No horizontal scroll at a phone viewport.
 *
 * The document must never be wider than the viewport (allowing 1px for
 * sub-pixel rounding). Horizontal overflow on mobile is a classic layout bug:
 * it produces a horizontal scrollbar and content that runs off the edge.
 */

const ROUTES = [
  "/",
  "/services",
  "/schedule",
  "/contact",
  "/dentist-palo-alto",
];

for (const route of ROUTES) {
  test(`no horizontal overflow at 390px on ${route}`, async ({ page }) => {
    await gotoAndHydrate(page, route);
    // Let any deferred chrome / images that could push width settle.
    await expect(page.locator("main")).toBeVisible();

    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));

    const overflow = scrollWidth - innerWidth;
    expect(
      scrollWidth,
      `${route} overflows horizontally by ${overflow}px ` +
        `(scrollWidth=${scrollWidth}, innerWidth=${innerWidth})`,
    ).toBeLessThanOrEqual(innerWidth + 1);
  });
}
