import { test, expect, type Page } from "@playwright/test";
import { advanceFunnelToContactStep, gotoAndHydrate } from "./_helpers";

/**
 * Kill mutants on the appointment-request lead guard.
 *
 * Synthetic data only. The live /api/schedule-request (and Formspree) is
 * mocked for every test — never submit the production form.
 *
 * M1: a 500 must not fire generate_lead.
 * M3: a double submit must send only one request.
 */

const SYNTHETIC = {
  firstName: "Jamie",
  lastName: "Example",
  email: "jamie.example@example.com",
} as const;

async function installOutcomeProbe(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__cwScheduleOutcomes = [];
  });
}

async function fillSyntheticEmailContact(page: Page): Promise<void> {
  await page.getByLabel("First name").fill(SYNTHETIC.firstName);
  await page.getByLabel("Last name").fill(SYNTHETIC.lastName);
  await page
    .getByRole("radiogroup", { name: /preferred contact method/i })
    .locator("label")
    .filter({ hasText: /^Email/i })
    .click();
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill(SYNTHETIC.email);
}

async function readOutcomes(page: Page) {
  return page.evaluate(() => window.__cwScheduleOutcomes ?? []);
}

test.describe("schedule lead guard", () => {
  test("M1: a 500 error does not fire generate_lead and shows Try Sending Again", async ({
    page,
  }) => {
    await installOutcomeProbe(page);

    await page.route("**/api/schedule-request", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          message:
            "We couldn't send your request. Please call the office or try again.",
        }),
      });
    });

    await gotoAndHydrate(page, "/schedule");
    await advanceFunnelToContactStep(page);
    await fillSyntheticEmailContact(page);

    await page
      .getByRole("button", { name: "Send Appointment Request", exact: true })
      .click();

    await expect(page.getByRole("alert")).toContainText("Your request wasn't sent");
    await expect(
      page.getByRole("button", { name: "Try Sending Again", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "We'll confirm your appointment shortly." }),
    ).toHaveCount(0);

    const outcomes = await readOutcomes(page);
    expect(outcomes.length, "submit must publish an outcome").toBeGreaterThan(0);
    expect(
      outcomes.some((entry) => entry.leadFired),
      "M1: generate_lead must not fire on a 500",
    ).toBe(false);
    expect(outcomes.every((entry) => entry.success === false)).toBe(true);
  });

  test("accepted JSON success publishes a lead; HTML 200 does not", async ({
    page,
  }) => {
    await installOutcomeProbe(page);

    let mode: "html" | "ok" = "html";
    await page.route("**/api/schedule-request", async (route) => {
      if (mode === "html") {
        await route.fulfill({
          status: 200,
          contentType: "text/html",
          body: "<html><body>Thanks</body></html>",
        });
        return;
      }

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await gotoAndHydrate(page, "/schedule");
    await advanceFunnelToContactStep(page);
    await fillSyntheticEmailContact(page);

    await page
      .getByRole("button", { name: "Send Appointment Request", exact: true })
      .click();

    await expect(
      page.getByRole("button", { name: "Try Sending Again", exact: true }),
    ).toBeVisible();
    expect((await readOutcomes(page)).some((entry) => entry.leadFired)).toBe(false);

    mode = "ok";
    await page.getByRole("button", { name: "Try Sending Again", exact: true }).click();

    await expect(
      page.getByRole("heading", { name: "We'll confirm your appointment shortly." }),
    ).toBeVisible();

    const outcomes = await readOutcomes(page);
    expect(
      outcomes.some((entry) => entry.leadFired && entry.success),
      "explicit success:true must fire a lead so the M1 probe is not vacuous",
    ).toBe(true);
  });

  test("M3: double-submit sends one request", async ({ page }) => {
    let requestCount = 0;
    await page.route("**/api/schedule-request", async (route) => {
      requestCount += 1;
      await new Promise((resolve) => {
        setTimeout(resolve, 750);
      });
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await gotoAndHydrate(page, "/schedule");
    await advanceFunnelToContactStep(page);
    await fillSyntheticEmailContact(page);

    await page
      .getByRole("button", { name: "Send Appointment Request", exact: true })
      .evaluate((button) => {
        const form = (button as HTMLButtonElement).form;
        form?.requestSubmit();
        form?.requestSubmit();
      });

    await expect(
      page.getByRole("heading", { name: "We'll confirm your appointment shortly." }),
    ).toBeVisible();
    expect(requestCount, "M3: double-submit must not send two requests").toBe(1);
  });
});
