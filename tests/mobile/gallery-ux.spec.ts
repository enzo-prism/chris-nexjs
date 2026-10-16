import { expect, test, type Page } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

async function mockMediaPlayback(page: Page): Promise<void> {
  // Keep keyboard behavior deterministic in CI. The gallery's production clips
  // remain remote, but this interaction test should not fail because a media
  // CDN request races the mocked play event or emits a transient error.
  await page.route(/res\.cloudinary\.com\/.*\.mp4(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      path: `${process.cwd()}/public/videos/office-frontdesk.mp4`,
      contentType: "video/mp4",
    });
  });

  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function play(): Promise<void> {
      Object.defineProperty(this, "paused", {
        configurable: true,
        value: false,
      });
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    };

    HTMLMediaElement.prototype.pause = function pause(): void {
      Object.defineProperty(this, "paused", {
        configurable: true,
        value: true,
      });
      this.dispatchEvent(new Event("pause"));
    };
  });
}

test("gallery controls and viewer work by keyboard", async ({ page }) => {
  await mockMediaPlayback(page);
  await gotoAndHydrate(page, "/gallery");

  await expect(
    page.getByRole("link", { name: /take the guided office tour/i }),
  ).toBeVisible();

  // The tile opener and video control are siblings, never nested controls.
  await expect(page.locator("button button, [role=button] button")).toHaveCount(0);

  const opener = page.getByRole("button", {
    name: /open a warm welcome in gallery viewer/i,
  });
  await opener.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: "A Warm Welcome" });
  await expect(dialog).toBeVisible();
  await expect(
    page.getByRole("button", { name: /close gallery viewer/i }),
  ).toBeFocused();

  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("dialog", { name: "Light-Filled Spaces" }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();

  await opener.click();
  const reopenedDialog = page.getByRole("dialog", { name: "A Warm Welcome" });
  await expect(reopenedDialog).toBeVisible();
  await reopenedDialog.click({ position: { x: 96, y: 20 } });
  await expect(reopenedDialog).not.toBeVisible();
  await expect(opener).toBeFocused();

  const previewControl = page.getByRole("button", {
    name: /play light-filled spaces preview/i,
  });
  // Playback pauses outside the viewport; settle scrolling before activating
  // the preview so its initial observer callback cannot interrupt playback.
  await previewControl.scrollIntoViewIfNeeded();
  await expect(previewControl).toBeInViewport({ ratio: 1 });
  await previewControl.focus();
  await expect(previewControl).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: /pause light-filled spaces preview/i }),
  ).toBeFocused();
  await page.keyboard.press("Space");
  await expect(previewControl).toBeFocused();
});

test("office tour videos expose keyboard play and pause", async ({ page }) => {
  await mockMediaPlayback(page);
  await gotoAndHydrate(page, "/office-tour");

  await expect(
    page.getByRole("link", { name: /browse the photo gallery/i }),
  ).toBeVisible();

  // Each clip is a StoryPlayer region: the big Play button starts it, focus
  // moves to the Play/Pause control, and Space toggles it without losing focus.
  for (const clipName of ["the garden courtyard", "finding the office"]) {
    const clip = page
      .getByRole("region", { name: new RegExp(clipName, "i") })
      .first();
    const start = clip.getByRole("button", {
      name: new RegExp(`^play ${clipName}`, "i"),
    });
    await start.scrollIntoViewIfNeeded();
    await start.focus();
    await page.keyboard.press("Enter");

    const pause = clip.getByRole("button", { name: "Pause", exact: true });
    await expect(pause).toBeFocused();
    await page.keyboard.press("Space");
    await expect(
      clip.getByRole("button", { name: "Play", exact: true }),
    ).toBeFocused();
  }
});
