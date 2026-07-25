import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

test("mobile navigation exposes the current page and restores focus on close", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/invisalign");

  const menuButton = page.locator('button[aria-controls="mobile-nav"]');
  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAccessibleName("Open navigation menu");

  const buttonBox = await menuButton.boundingBox();
  expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
  expect(buttonBox?.height).toBeGreaterThanOrEqual(44);

  await menuButton.click();
  await expect(menuButton).toHaveAccessibleName("Close navigation menu");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  const mobileNav = page.locator("#mobile-nav");
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByRole("button", { name: "Services" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(mobileNav.getByRole("link", { name: "Invisalign", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(mobileNav.getByRole("link", { name: "Home", exact: true })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(mobileNav).toHaveCount(0);
  await expect(menuButton).toHaveAccessibleName("Open navigation menu");
  await expect(menuButton).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("global appointment actions use one clear label and accessible contact names", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/");

  const actionBar = page.getByTestId("mobile-action-bar");
  await expect(actionBar).toBeVisible();
  await expect(actionBar.getByRole("link", { name: "Request an appointment" })).toContainText(
    "Request Appointment",
  );
  await expect(actionBar.getByRole("link", { name: /Call Dr\. Wong's office at/ })).toHaveAttribute(
    "href",
    /^tel:/,
  );
  await expect(
    actionBar.getByRole("link", { name: /Get directions.+opens in a new tab/ }),
  ).toHaveAttribute("target", "_blank");
});

test("mobile footer marks the current page and keeps contact actions tappable", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/privacy-policy");

  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  const callLink = footer.getByRole("link", { name: /Call Dr\. Wong's office at/ });
  const directionsLink = footer.getByRole("link", {
    name: /Get directions.+opens in a new tab/,
  });
  for (const link of [callLink, directionsLink]) {
    const box = await link.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test("schedule footer keeps every legal and accessibility destination", async ({ page }) => {
  await gotoAndHydrate(page, "/schedule");
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  for (const name of ["Privacy Policy", "Terms of Service", "HIPAA Notice", "Accessibility"]) {
    await expect(footer.getByRole("link", { name, exact: true })).toBeVisible();
  }
});
