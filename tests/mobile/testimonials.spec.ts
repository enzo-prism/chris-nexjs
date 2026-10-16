import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

// The homepage review ribbon: verbatim five-star quotes in a gentle,
// pausable marquee (a plain scrollable row for reduced motion).
const RIBBON = '[aria-labelledby="ribbon-title"]';

test("mobile shows readable patient quotes and a path to every review", async ({ page }) => {
  await gotoAndHydrate(page, "/");

  const section = page.locator(RIBBON);
  await expect(section).toBeVisible();
  await expect(section.getByRole("heading", { name: /five-star reviews/i })).toBeVisible();
  await expect(section.getByRole("link", { name: /read the reviews/i })).toBeVisible();
  expect(await section.locator("figure").count()).toBeGreaterThanOrEqual(6);

  const quote = section.locator("blockquote").first();
  await expect(quote).toBeVisible();
  const fontPx = await quote.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(fontPx, `mobile quote font-size ${fontPx}px`).toBeGreaterThanOrEqual(16);
});

test("desktop shows two ribbons of quotes", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoAndHydrate(page, "/");

  const ribbons = page.locator(`${RIBBON} section.marquee`);
  await expect(ribbons).toHaveCount(2);
  await expect(ribbons.nth(1)).toBeVisible();
});
