import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

test("stripped Invisalign header logo has a 44x44 tap target", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoAndHydrate(page, "/invisalign-consult");

  const logo = page.getByRole("link", { name: "Christopher B. Wong, DDS home" });
  await expect(logo).toBeVisible();
  const box = await logo.boundingBox();
  expect(box, "conversion header logo link should be laid out").toBeTruthy();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
});
