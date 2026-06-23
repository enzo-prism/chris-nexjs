import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

/**
 * The homepage "What Our Patients Say" section has two distinct layouts:
 * a rich desktop carousel (photo + side quote + preview cards) for lg+ and a
 * compact single-card layout for mobile. Exactly one must show at each
 * breakpoint, so mobile users always get the mobile design.
 */
const DESKTOP = '[aria-label="Patient testimonials carousel"]';
const MOBILE = '[aria-label="Patient testimonials"]';

test("mobile shows the compact testimonial card; desktop layout is hidden", async ({
  page,
}) => {
  // The mobile-chrome project runs at an iPhone 13 viewport (390px).
  await gotoAndHydrate(page, "/");

  await expect(page.locator(MOBILE)).toBeVisible();
  await expect(page.locator(DESKTOP)).toBeHidden();

  // The compact card must keep a readable quote (not the desktop 24px size).
  const quote = page.locator(`${MOBILE} p.italic`).first();
  await expect(quote).toBeVisible();
  const fontPx = await quote.evaluate(
    (el) => parseFloat(getComputedStyle(el).fontSize),
  );
  expect(fontPx, `mobile quote font-size ${fontPx}px`).toBeLessThanOrEqual(20);
});

test("desktop shows the rich carousel; mobile card is hidden", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoAndHydrate(page, "/");

  await expect(page.locator(DESKTOP)).toBeVisible();
  await expect(page.locator(MOBILE)).toBeHidden();
});
