import { test, expect, type Page } from "@playwright/test";
import { advanceFunnelToContactStep, gotoAndHydrate } from "./_helpers";

/**
 * Conversion-path guards for the September 2026 homepage and /schedule work.
 * No test here sends a real lead: every submission is intercepted.
 */

type CapturedRequest = Record<string, unknown> & {
  attribution?: { channel?: string; landingPath?: string };
  utmParams?: Record<string, string>;
  insuranceProvider?: string;
};

async function captureScheduleRequests(page: Page): Promise<CapturedRequest[]> {
  const captured: CapturedRequest[] = [];
  await page.route("**/api/schedule-request", async (route) => {
    captured.push(route.request().postDataJSON() as CapturedRequest);
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });
  return captured;
}

test("step 1 of the appointment form starts in the first phone screen", async ({ page }) => {
  await gotoAndHydrate(page, "/schedule");

  const appointmentGroup = page.getByRole("radiogroup", { name: /appointment type/i });
  await appointmentGroup.waitFor({ state: "visible", timeout: 20_000 });
  const firstOption = appointmentGroup.locator("label").first();
  const box = await firstOption.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(
    box!.y + box!.height,
    `first appointment option ends at ${box!.y + box!.height}px; viewport is ${viewport!.height}px`,
  ).toBeLessThanOrEqual(viewport!.height);

  // The emergency path stays one tap away, as a call link rather than a banner.
  await expect(page.getByRole("link", { name: /dental emergency\? call/i })).toHaveAttribute(
    "href",
    /^tel:/,
  );
});

test("insurance field is visible on the contact step and explains out-of-network", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/schedule");
  await advanceFunnelToContactStep(page);

  const insurance = page.getByLabel(/dental insurance provider/i);
  await insurance.scrollIntoViewIfNeeded();
  await expect(insurance).toBeVisible();
  await expect(page.getByText(/out-of-network with PPO plans/i).first()).toBeVisible();
});

test("a Google Business Profile visit keeps its source through to the appointment request", async ({
  page,
}) => {
  const captured = await captureScheduleRequests(page);

  await gotoAndHydrate(page, "/?utm_source=google&utm_medium=organic&utm_campaign=gbp_website");
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem("cw_lead_attribution_v1")),
    )
    .toContain("google_business_profile");

  const hero = page
    .getByRole("heading", { name: /conservative dentistry in palo alto/i })
    .locator("xpath=ancestor::section[1]");
  await hero.getByRole("link", { name: "Request an appointment", exact: true }).click();
  await expect(page).toHaveURL(/\/schedule#appointment$/);

  await advanceFunnelToContactStep(page);
  await page.getByLabel("First name").fill("Jamie");
  await page.getByLabel("Last name").fill("Example");
  await page.getByLabel("Phone number").fill("6505550100");
  await page.getByLabel(/dental insurance provider/i).fill("Delta Dental");
  await page.getByRole("button", { name: "Send Appointment Request", exact: true }).click();

  await expect(
    page.getByRole("heading", { name: "We'll confirm your appointment shortly." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "patient forms" })).toHaveAttribute(
    "href",
    "/patient-resources",
  );

  expect(captured).toHaveLength(1);
  expect(captured[0].attribution).toMatchObject({
    channel: "google_business_profile",
    landingPath: "/",
  });
  expect(captured[0].utmParams).toMatchObject({ utm_campaign: "gbp_website" });
  expect(captured[0].insuranceProvider).toBe("Delta Dental");
});

test("a later direct visit does not erase a known source", async ({ page }) => {
  await gotoAndHydrate(page, "/?utm_source=gbp");
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem("cw_lead_attribution_v1")),
    )
    .toContain("google_business_profile");

  // A brand-new page load with no tags or referrer (typed URL / bookmark).
  await gotoAndHydrate(page, "/services");
  await page.waitForTimeout(500);
  const stored = await page.evaluate(() =>
    window.localStorage.getItem("cw_lead_attribution_v1"),
  );
  expect(stored).toContain("google_business_profile");
});

test("the homepage intro video plays the self-hosted Meet Dr. Wong clip", async ({ page }) => {
  await gotoAndHydrate(page, "/");

  await page.getByRole("button", { name: /watch dr\. wong.s 1-minute intro/i }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("video")).toHaveAttribute("src", "/videos/meet-dr-wong.mp4");
  await dialog.getByRole("button", { name: "Close video" }).click();
  await expect(dialog).toBeHidden();
});

test("homepage explains insurance and cost before the reviews", async ({ page }) => {
  await gotoAndHydrate(page, "/");

  const cost = page.locator("#insurance-and-cost");
  await expect(cost.getByRole("heading", { name: /know your cost before you commit/i })).toBeVisible();
  await expect(cost).toContainText("Visa, MasterCard, and FSA/HSA");
  await expect(cost).toContainText("in-house dental plan");
  await expect(cost).not.toContainText(/carecredit/i);

  await expect(
    page.getByRole("navigation", { name: "For current patients" }).getByRole("link", {
      name: /patient forms/i,
    }),
  ).toHaveAttribute("href", "/patient-resources");
});
