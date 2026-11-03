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
  // A location page: the widest layouts on the site (hero + city cards).
  // `/dentist-palo-alto` used to be listed here but has never existed as a
  // route, so this case was silently asserting against the 404 page.
  "/dentist-menlo-park",
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

// /reviews redirects to /testimonials. A 2px overflow here came from the
// nowrap "Show more reviews" button, so assert scrollWidth against clientWidth
// at the QA viewports — no 1px slack.
const REVIEWS_PATH = "/reviews";
const REVIEWS_WIDTHS = [320, 390, 1440] as const;

for (const width of REVIEWS_WIDTHS) {
  test(`no horizontal overflow at ${width}px on ${REVIEWS_PATH}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width >= 1440 ? 900 : 720 });
    await gotoAndHydrate(page, REVIEWS_PATH);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator('[data-review-surface="testimonials-hero"]')).toBeVisible();

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(
      scrollWidth,
      `${REVIEWS_PATH} at ${width}px overflows by ${scrollWidth - clientWidth}px ` +
        `(scrollWidth=${scrollWidth}, clientWidth=${clientWidth})`,
    ).toBeLessThanOrEqual(clientWidth);
  });
}
