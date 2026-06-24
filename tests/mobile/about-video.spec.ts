import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

/**
 * The About page "Meet Dr. Wong" interview plays a self-hosted local clip
 * (no YouTube embed). Clicking the button must open a modal with a native
 * <video> sourced from /videos/, with controls — and no YouTube iframe.
 */
test("About interview plays a local self-hosted video (no YouTube)", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/about");

  await page.getByRole("button", { name: /watch interview/i }).first().click();

  const video = page.locator('video[src*="/videos/"]');
  await expect(video).toHaveCount(1);
  await expect(video).toHaveJSProperty("controls", true);

  // No third-party YouTube/Vimeo iframe.
  await expect(
    page.locator('iframe[src*="youtube"], iframe[src*="youtu.be"]'),
  ).toHaveCount(0);
});
