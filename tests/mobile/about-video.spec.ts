import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

/**
 * The About page "Meet Dr. Wong" interview plays the self-hosted local clip in
 * the custom StoryPlayer (no YouTube embed). The <video> renders up front with
 * a poster and preload="none"; pressing play sets its source to
 * /videos/meet-dr-wong.mp4 and swaps the big play button for labelled custom
 * controls, with keyboard focus landing on Pause.
 */
test("About interview plays a local self-hosted video (no YouTube)", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/about");

  const player = page.getByRole("region", { name: /meet dr\. wong/i }).first();
  await expect(player).toBeVisible();

  const play = player.getByRole("button", { name: /^play meet dr\. wong/i });
  await play.focus();
  await page.keyboard.press("Enter");

  await expect(player).not.toHaveAttribute("data-state", "idle");
  await expect
    .poll(() =>
      player
        .locator("video")
        .first()
        .evaluate((v) => (v as HTMLVideoElement).currentSrc),
    )
    .toContain("/videos/meet-dr-wong.mp4");

  // Custom controls replace native ones; focus moves to the Play/Pause control.
  await expect(player.getByRole("button", { name: /^(pause|play)$/i })).toBeFocused();
  await expect(player.getByRole("slider", { name: "Seek" })).toBeAttached();

  // No third-party YouTube/Vimeo iframe.
  await expect(
    page.locator('iframe[src*="youtube"], iframe[src*="youtu.be"]'),
  ).toHaveCount(0);
});
