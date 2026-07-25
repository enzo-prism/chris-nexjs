import { expect, test, type Locator, type Page } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

async function expectPath(page: Page, pathname: string): Promise<void> {
  await expect
    .poll(() => new URL(page.url()).pathname, {
      message: `expected navigation to ${pathname}`,
    })
    .toBe(pathname);
}

async function clickAndExpectPath(
  page: Page,
  link: Locator,
  pathname: string,
): Promise<void> {
  await expect(link).toBeVisible();
  await link.click();
  await expectPath(page, pathname);
}

test("homepage primary CTAs reach the scheduling funnel and services hub", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/");

  const hero = page
    .getByRole("heading", {
      name: /dentist in palo alto.*christopher b\. wong/i,
    })
    .locator("xpath=ancestor::section[1]");

  await clickAndExpectPath(
    page,
    hero.getByRole("link", { name: "Request an appointment", exact: true }),
    "/schedule",
  );
  await expect(page).toHaveURL(/\/schedule#appointment$/);
  await expect(
    page.getByRole("heading", { name: "Request Your Appointment", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("radiogroup", { name: /appointment type/i })).toBeVisible();

  await gotoAndHydrate(page, "/");
  await clickAndExpectPath(
    page,
    page
      .getByRole("heading", {
        name: /dentist in palo alto.*christopher b\. wong/i,
      })
      .locator("xpath=ancestor::section[1]")
      .getByRole("link", { name: "Explore services", exact: true }),
    "/services",
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/dental services/i);
});

test("mobile quick actions expose working call, directions, and visit links", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/");

  const bar = page.getByTestId("mobile-action-bar");
  await expect(bar).toBeVisible();
  await expect(bar.getByRole("link")).toHaveCount(3);
  await expect(bar.getByRole("link", { name: /call dr\. wong's office at/i })).toHaveAttribute(
    "href",
    /^tel:\+1\d{10}$/,
  );
  await expect(
    bar.getByRole("link", { name: /get directions.+opens in a new tab/i }),
  ).toHaveAttribute("target", "_blank");

  await clickAndExpectPath(
    page,
    bar.getByRole("link", { name: "Request an appointment", exact: true }),
    "/schedule",
  );
  await expect(page).toHaveURL(/\/schedule#appointment$/);
  await expect(page.getByTestId("mobile-action-bar")).toHaveCount(0);
});

test("mobile menu supports touch and keyboard navigation without trapping scroll", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/");

  const toggle = page.locator('button[aria-controls="mobile-nav"]');
  await expect(toggle).toHaveAccessibleName("Open navigation menu");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.focus();
  await page.keyboard.press("Enter");

  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(toggle).toHaveAccessibleName("Close navigation menu");
  await expect(page.locator("#mobile-nav")).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toHaveAccessibleName("Open navigation menu");
  await expect(page.locator("#mobile-nav")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(toggle).toBeFocused();

  await toggle.click();
  const mobileNav = page.locator("#mobile-nav");
  const servicesToggle = mobileNav.getByRole("button", {
    name: "Services",
    exact: true,
  });
  await servicesToggle.click();
  await expect(servicesToggle).toHaveAttribute("aria-expanded", "true");

  await clickAndExpectPath(
    page,
    mobileNav.getByRole("link", { name: "Invisalign", exact: true }),
    "/invisalign",
  );
  await expect(page.locator("#mobile-nav")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("footer quick links and legal links are usable on mobile", async ({ page }) => {
  await gotoAndHydrate(page, "/");

  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  const quickLinks = footer.getByRole("button", { name: "Quick Links", exact: true });
  await quickLinks.click();
  await expect(quickLinks).toHaveAttribute("aria-expanded", "true");

  await clickAndExpectPath(
    page,
    footer.getByRole("link", { name: "Contact", exact: true }).filter({ visible: true }),
    "/contact",
  );
  await expect(
    page.getByRole("heading", { name: /contact dr\. wong's palo alto dental office/i }),
  ).toBeVisible();

  const contactFooter = page.locator("footer");
  await contactFooter.scrollIntoViewIfNeeded();
  await clickAndExpectPath(
    page,
    contactFooter.getByRole("link", { name: "Privacy Policy", exact: true }).filter({
      visible: true,
    }),
    "/privacy-policy",
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/privacy policy/i);
});

test("services and contact conversion CTAs lead to the intended next step", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/services");

  const preventiveIntentLink = page.getByRole("link", {
    name: "Request an appointment for Preventive Dentistry",
    exact: true,
  });
  await expect(preventiveIntentLink).toHaveAttribute(
    "href",
    "/schedule?intent=preventive&source=service-card#appointment",
  );
  await clickAndExpectPath(page, preventiveIntentLink, "/schedule");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("intent"))
    .toBe("preventive");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("source"))
    .toBe("service-card");
  await expect(page).toHaveURL(/#appointment$/);

  await gotoAndHydrate(page, "/services");

  const servicesCta = page
    .getByRole("heading", { name: "Ready to Request an Appointment?", exact: true })
    .locator("xpath=ancestor::section[1]");
  await clickAndExpectPath(
    page,
    servicesCta.getByRole("link", { name: "Request an Appointment", exact: true }),
    "/schedule",
  );
  await expect(page).toHaveURL(/\/schedule#appointment$/);

  await gotoAndHydrate(page, "/services");
  await clickAndExpectPath(
    page,
    page
      .getByRole("heading", { name: "Ready to Request an Appointment?", exact: true })
      .locator("xpath=ancestor::section[1]")
      .getByRole("link", { name: "Ask a Question", exact: true }),
    "/contact",
  );

  await expect(page.getByRole("link", { name: /call the office/i })).toHaveAttribute(
    "href",
    /^tel:\+1\d{10}$/,
  );
  await expect(page.getByRole("link", { name: /email the practice/i })).toHaveAttribute(
    "href",
    /^mailto:[^@]+@[^@]+$/,
  );
  await expect(page.getByRole("link", { name: /visit the office/i })).toHaveAttribute(
    "target",
    "_blank",
  );

  const appointmentAside = page
    .getByRole("heading", { name: "Ready to request an appointment?", exact: true })
    .locator("xpath=ancestor::aside[1]");
  await clickAndExpectPath(
    page,
    appointmentAside.getByRole("link", { name: "Request an appointment", exact: true }),
    "/schedule",
  );
  await expect(page).toHaveURL(/\/schedule#appointment$/);
});

test("schedule funnel validates, advances, and returns without losing the selected visit", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/schedule");

  const conversionHeader = page.locator("header");
  await expect(conversionHeader.getByRole("link", { name: /^call/i })).toHaveAttribute(
    "href",
    /^tel:\+1\d{10}$/,
  );

  const continueButton = page.getByRole("button", { name: /^Continue to / });
  await continueButton.click();
  await expect(
    page.getByRole("alert").filter({ hasText: /please fix the fields/i }),
  ).toContainText(/please select an appointment type/i);

  const appointmentGroup = page.getByRole("radiogroup", { name: /appointment type/i });
  const selectedVisit = appointmentGroup.locator("label").first();
  const selectedVisitText = (await selectedVisit.innerText()).trim();
  await selectedVisit.click();
  await continueButton.click();

  await expect(
    page.getByRole("heading", { name: "How can we reach you?", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Send Appointment Request", exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "What do you need?", exact: true }),
  ).toBeFocused();
  await expect(appointmentGroup.locator('[role="radio"][data-state="checked"]')).toHaveCount(1);
  await expect(selectedVisit).toContainText(selectedVisitText);
});

test("key pages expose no dead internal links", async ({ page, request }) => {
  const sourceRoutes = ["/", "/services", "/contact", "/schedule"] as const;
  const internalUrls = new Set<string>();

  for (const route of sourceRoutes) {
    await gotoAndHydrate(page, route);
    const hrefs = await page.locator('a[href]').evaluateAll((anchors) =>
      anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
    );

    for (const href of hrefs) {
      const url = new URL(href);
      if (url.origin !== new URL(page.url()).origin) continue;
      if (url.pathname.startsWith("/api/")) continue;
      url.hash = "";
      internalUrls.add(url.toString());
    }
  }

  expect(internalUrls.size, "expected internal links on the audited pages").toBeGreaterThan(20);

  const failures: string[] = [];
  for (const url of [...internalUrls].sort()) {
    const response = await request.get(url, { timeout: 15_000 });
    if (response.status() >= 400) {
      failures.push(`${response.status()} ${new URL(url).pathname}`);
    }
  }

  expect(
    failures,
    `Dead internal links found on key conversion pages:\n${failures.join("\n")}`,
  ).toEqual([]);
});
