import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

const PATIENT_PROOF = '[aria-labelledby="patient-proof-title"]';

test("mobile shows three readable patient stories", async ({ page }) => {
  await gotoAndHydrate(page, "/");

  const section = page.locator(PATIENT_PROOF);
  await expect(section).toBeVisible();
  await expect(section.getByRole("heading", { name: /care people feel good about returning to/i })).toBeVisible();
  await expect(section.locator("article")).toHaveCount(3);
  await expect(section.getByRole("link", { name: /read more patient stories/i })).toBeVisible();

  const quote = section.locator("blockquote").first();
  await expect(quote).toBeVisible();
  const fontPx = await quote.evaluate(
    (el) => parseFloat(getComputedStyle(el).fontSize),
  );
  expect(fontPx, `mobile quote font-size ${fontPx}px`).toBeGreaterThanOrEqual(16);
});

test("desktop shows the static three-story proof grid", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoAndHydrate(page, "/");

  const section = page.locator(PATIENT_PROOF);
  await expect(section).toBeVisible();
  await expect(section.locator("article")).toHaveCount(3);
});
