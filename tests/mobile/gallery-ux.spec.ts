import { expect, test, type Page } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

async function mockMediaPlayback(page: Page): Promise<void> {
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
    page.getByRole("link", { name: /watch the guided office tour/i }),
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
  await previewControl.focus();
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

  const heroPlay = page.getByRole("button", {
    name: /play the office tour video/i,
  });
  await heroPlay.focus();
  await page.keyboard.press("Enter");

  const heroPause = page.getByRole("button", {
    name: /pause the office tour video/i,
  });
  await expect(heroPause).toBeVisible();
  await heroPause.focus();
  await page.keyboard.press("Space");
  await expect(heroPlay).toBeVisible();

  const clipPlay = page.getByRole("button", {
    name: /play the easy to find video/i,
  });
  await clipPlay.focus();
  await page.keyboard.press("Enter");
  const clipPause = page.getByRole("button", {
    name: /pause the easy to find video/i,
  });
  await expect(clipPause).toBeFocused();
  await page.keyboard.press("Space");
  await expect(clipPlay).toBeFocused();
});
