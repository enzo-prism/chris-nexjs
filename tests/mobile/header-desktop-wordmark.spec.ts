import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

test("main header phone stays on one line and the subline is full at 1440", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoAndHydrate(page, "/");

  const phone = page.locator('header a[data-analytics-context="header-call"]');
  await expect(phone).toBeVisible();
  await expect(phone).toContainText("(650) 326-6319");
  await expect(phone).toHaveCSS("white-space", "nowrap");
  const phoneBox = await phone.boundingBox();
  expect(phoneBox, "header phone should be laid out").toBeTruthy();
  expect(phoneBox?.height ?? 0).toBeLessThanOrEqual(44);

  const subline = page.locator("header").getByText("Family & Cosmetic Dentistry · Palo Alto");
  await expect(subline).toBeVisible();
  const overflow = await subline.evaluate((el) => ({
    text: (el.textContent ?? "").trim(),
    truncated: el.scrollWidth > el.clientWidth + 1,
  }));
  expect(overflow.text).toBe("Family & Cosmetic Dentistry · Palo Alto");
  expect(overflow.truncated, "1440 subline must not ellipsize").toBe(false);
});

test("390 compact header still shows the short subline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoAndHydrate(page, "/");

  const compact = page.locator("header").getByText("Palo Alto Dentistry");
  await expect(compact).toBeVisible();
  await expect(page.locator("header").getByText("Family & Cosmetic Dentistry · Palo Alto")).toBeHidden();
  await expect(page.locator('header a[data-analytics-context="header-call"]')).toBeHidden();
});
