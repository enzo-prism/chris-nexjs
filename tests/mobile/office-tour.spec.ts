import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

/**
 * /office-tour is the "Full Circle" film's watch page plus four short office
 * clips, all in the custom StoryPlayer. Verify it loads cleanly on mobile: one
 * h1, click-to-play clips (poster + play button, preload="none" so no video
 * bytes download on cellular until someone presses play), and no horizontal
 * overflow.
 */
test("office tour page renders cleanly on mobile", async ({ page }) => {
  await gotoAndHydrate(page, "/office-tour");

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toContainText(/office/i);

  // Clips are click-to-play.
  await expect(
    page.getByRole("button", { name: /play the garden courtyard/i }),
  ).toBeAttached();

  // Four office clips plus the film, each behind a poster and preload="none".
  const postered = page.locator("video[poster]");
  expect(await postered.count()).toBeGreaterThanOrEqual(5);
  const eager = await postered.evaluateAll(
    (vs) => vs.filter((v) => (v as HTMLVideoElement).preload !== "none").length,
  );
  expect(eager, "postered videos should not preload").toBe(0);

  // No horizontal overflow at 390px.
  const { scrollW, innerW } = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
  }));
  expect(scrollW, `horizontal overflow ${scrollW - innerW}px`).toBeLessThanOrEqual(
    innerW + 1,
  );
});
