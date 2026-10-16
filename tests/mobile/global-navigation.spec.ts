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

  const mobileNav = page.getByRole("dialog", { name: "Mobile navigation" });
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav).toHaveAttribute("aria-modal", "true");
  // The group holding the current page opens itself and marks the page.
  await expect(mobileNav.getByRole("link", { name: "Invisalign", exact: true })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Invisalign", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  // Initial focus lands on the dialog's close control.
  await expect(mobileNav.getByRole("button", { name: "Close navigation menu" })).toBeFocused();

  // Focus is contained: Tab from the last focusable wraps to the first, and back.
  const firstLink = mobileNav.getByRole("link", { name: "Christopher B. Wong, DDS home" });
  await mobileNav.evaluate((dialog) => {
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), summary'),
    ).filter((el) => el.checkVisibility()); // skips links inside closed <details>
    focusable[focusable.length - 1]?.focus();
  });
  await page.keyboard.press("Tab");
  await expect(firstLink).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  const lastIsFocused = await mobileNav.evaluate((dialog) => {
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), summary'),
    ).filter((el) => el.checkVisibility()); // skips links inside closed <details>
    return document.activeElement === focusable[focusable.length - 1];
  });
  expect(lastIsFocused).toBe(true);

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

  // The floating bar slides in once the visitor scrolls past the hero.
  await page.mouse.wheel(0, 900);
  const actionBar = page.getByTestId("mobile-action-bar");
  await expect(actionBar).toBeVisible();
  await expect(actionBar).toHaveAttribute("data-visible", "true");
  await expect(actionBar.getByRole("link", { name: "Request an appointment" })).toContainText(
    "Request a visit",
  );
  await expect(actionBar.getByRole("link", { name: /Call Dr\. Wong's office at/ })).toHaveAttribute(
    "href",
    /^tel:/,
  );
  await expect(
    actionBar.getByRole("link", { name: /Get directions.+opens in a new tab/ }),
  ).toHaveAttribute("target", "_blank");
});

test("homepage care finder links are single tappable links without stock imagery", async ({ page }) => {
  await gotoAndHydrate(page, "/");

  const services = page.locator("#find-care");
  await expect(services).toBeVisible();
  const carePaths = services.locator("ul > li > a");
  await expect(carePaths).toHaveCount(8);
  await expect(services.locator("img")).toHaveCount(0);

  for (const box of await carePaths.evaluateAll((links) =>
    links.map((link) => link.getBoundingClientRect().height),
  )) {
    expect(box, "care-path link is shorter than 44px").toBeGreaterThanOrEqual(44);
  }

  await services.getByRole("link", { name: /tooth pain/i }).click();
  await expect(page).toHaveURL(/\/emergency-dental$/);
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
