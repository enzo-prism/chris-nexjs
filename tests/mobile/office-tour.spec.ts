import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

/**
 * The /office-tour page features locally-hosted office videos. Verify it loads
 * cleanly on mobile: one h1, a click-to-play hero (poster image + play button,
 * so video bytes aren't auto-downloaded on cellular), three lazy tour clips
 * (each with a poster), and no horizontal overflow.
 */
test("office tour page renders cleanly on mobile", async ({ page }) => {
  await gotoAndHydrate(page, "/office-tour");

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toContainText(/office/i);

  // Hero is click-to-play (no auto-loaded video on first paint).
  await expect(
    page.getByRole("button", { name: /play the office tour/i }),
  ).toBeVisible();

  // The three tour-stop clips lazy-load (preload="none") behind posters.
  const videos = page.locator("video");
  await expect(videos).toHaveCount(3);
  const postered = await videos.evaluateAll(
    (vs) => vs.filter((v) => (v as HTMLVideoElement).poster).length,
  );
  expect(postered).toBe(3);

  // No horizontal overflow at 390px.
  const { scrollW, innerW } = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
  }));
  expect(scrollW, `horizontal overflow ${scrollW - innerW}px`).toBeLessThanOrEqual(
    innerW + 1,
  );
});
