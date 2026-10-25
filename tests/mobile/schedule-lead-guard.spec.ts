import { test, expect, type Page, type Route } from "@playwright/test";
import { advanceFunnelToContactStep, gotoAndHydrate } from "./_helpers";

/**
 * Kill mutants on the appointment-request lead guard.
 *
 * Synthetic data only. The live /api/schedule-request (and Formspree) is
 * mocked for every test — never submit the production form.
 *
 * Assertions count real window.gtag / dataLayer events, not a test-only flag.
 */

const SYNTHETIC = {
  firstName: "Jamie",
  lastName: "Example",
  email: "jamie.example@example.com",
} as const;

const ROUTES = ["/schedule", "/invisalign-consult"] as const;

async function installGtagProbe(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.dataLayer = [];
    window.gtag = (...args: unknown[]) => {
      window.dataLayer = window.dataLayer ?? [];
      window.dataLayer.push(args);
    };
    try {
      window.localStorage.setItem("analytics_consent", "granted");
    } catch {
      // ignore
    }
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

async function openContactStep(page: Page, path: string): Promise<void> {
  await gotoAndHydrate(page, `https://www.chriswongdds.com${path}`);
  await advanceFunnelToContactStep(page, { dismissConsent: false });
  await fillSyntheticEmailContact(page);
}

async function countGtagEvents(page: Page, eventName: string): Promise<number> {
  return page.evaluate((name) => {
    const layer = window.dataLayer ?? [];
    return layer.filter((entry) => {
      const args = Array.isArray(entry) ? entry : Array.from(entry as ArrayLike<unknown>);
      return args[0] === "event" && args[1] === name;
    }).length;
  }, eventName);
}

async function readGenerateLeadFormNames(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const layer = window.dataLayer ?? [];
    const names: string[] = [];
    for (const entry of layer) {
      const args = Array.isArray(entry) ? entry : Array.from(entry as ArrayLike<unknown>);
      if (args[0] !== "event" || args[1] !== "generate_lead") continue;
      const props = args[2];
      if (props && typeof props === "object" && "form_name" in props) {
        names.push(String((props as { form_name: string }).form_name));
      }
    }
    return names;
  });
}

async function mockScheduleApi(
  page: Page,
  handler: (route: Route) => Promise<void>,
): Promise<void> {
  await page.route("**/api/schedule-request", handler);
}

test.describe("schedule lead guard", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // Exercise the real production hostname guard against local files. Every
    // production-origin request is intercepted; no public site is accessed.
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.hostname !== "www.chriswongdds.com") {
        await route.abort();
        return;
      }
      if (route.request().method() !== "GET") {
        // Individual tests install their API mock after this fallback.
        await route.abort();
        return;
      }
      if (route.request().headers()["next-router-prefetch"] === "1") {
        await route.abort();
        return;
      }
      try {
        const response = await route.fetch({
          url: `${baseURL}${url.pathname}${url.search}`, timeout: 10_000,
        });
        await route.fulfill({ response });
      } catch {
        // Next may cancel a background read as the page/context closes. A
        // required navigation still fails the status/visible-UI assertions.
        await route.abort().catch(() => {});
      }
    });
  });
  test.afterEach(async ({ page }) => {
    // Drop canceled background reads before the browser context closes.
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });
  test("consult page excludes session recording and tracks its consult CTA", async ({ page }) => {
    await installGtagProbe(page);
    await page.addInitScript(() => { window.__cwAnalyticsImmediate = true; });
    await gotoAndHydrate(page, "https://www.chriswongdds.com/invisalign-consult");
    await page.getByRole("button", { name: "Continue to Contact Details", exact: true }).waitFor();
    await page.getByRole("link", { name: "Request an Invisalign consult", exact: true }).first().click();
    await expect.poll(() => countGtagEvents(page, "book_appointment_click")).toBe(1);
    // Both loaders are mounted; the immediate-load probe makes a missing
    // sensitive-route exclusion observable without making any vendor request.
    await page.waitForTimeout(1_000);
    await expect(page.locator('script[src*="static.hotjar.com"]')).toHaveCount(0);
    await expect(page.locator("#appointment")).toHaveAttribute("data-hj-suppress", "");
    expect(await countGtagEvents(page, "generate_lead")).toBe(0);
  });

  for (const path of ROUTES) {
    test(`M1: 500 on ${path} does not fire generate_lead`, async ({ page }) => {
      await installGtagProbe(page);
      await mockScheduleApi(page, async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            message:
              "We couldn't send your request. Please call the office or try again.",
          }),
        });
      });

      await openContactStep(page, path);
      await page
        .getByRole("button", { name: "Send Appointment Request", exact: true })
        .click();

      await expect(page.getByText("Your request wasn't sent")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Try Sending Again", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: /We'll confirm your appointment shortly\.|Your consultation request was sent\./ }),
      ).toHaveCount(0);

      expect(
        await countGtagEvents(page, "generate_lead"),
        "M1: generate_lead must not fire on a 500",
      ).toBe(0);
    });
  }

  test("accepted JSON success fires generate_lead once; HTML 200 does not", async ({
    page,
  }) => {
    await installGtagProbe(page);
    let mode: "html" | "ok" = "html";
    await mockScheduleApi(page, async (route) => {
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

    await openContactStep(page, "/schedule");
    await page
      .getByRole("button", { name: "Send Appointment Request", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Try Sending Again", exact: true }),
    ).toBeVisible();
    expect(await countGtagEvents(page, "generate_lead")).toBe(0);

    mode = "ok";
    await page.getByRole("button", { name: "Try Sending Again", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: /We'll confirm your appointment shortly\.|Your consultation request was sent\./ }),
    ).toBeVisible();
    expect(
      await countGtagEvents(page, "generate_lead"),
      "explicit success:true must fire generate_lead once",
    ).toBe(1);
  });

  test("preview demo makes no lead and does not claim office receipt", async ({ page }) => {
    await installGtagProbe(page);
    await mockScheduleApi(page, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json",
        body: JSON.stringify({ ok: true, accepted: false, preview: true }) });
    });
    await openContactStep(page, "/invisalign-consult");
    await page.getByRole("button", { name: "Send Appointment Request", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Preview complete. Nothing was sent." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Preview complete. Nothing was sent." })).toBeInViewport();
    await expect(page.getByRole("status").filter({ hasText: "Preview only" })).toContainText("office has not received a request");
    expect(await countGtagEvents(page, "generate_lead")).toBe(0);
    expect(await countGtagEvents(page, "schedule_submit_success")).toBe(0);
  });

  test("M3: double-submit sends one request", async ({ page }) => {
    let requestCount = 0;
    await mockScheduleApi(page, async (route) => {
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

    await openContactStep(page, "/schedule");
    await page
      .getByRole("button", { name: "Send Appointment Request", exact: true })
      .evaluate((button) => {
        const form = (button as HTMLButtonElement).form;
        form?.requestSubmit();
        form?.requestSubmit();
      });

    await expect(
      page.getByRole("heading", { name: /We'll confirm your appointment shortly\.|Your consultation request was sent\./ }),
    ).toBeVisible();
    expect(requestCount, "M3: double-submit must not send two requests").toBe(1);
  });

  test("S1: hung request aborts and leaves Try Sending Again, not a stuck spinner", async ({
    page,
  }) => {
    test.setTimeout(45_000);
    await installGtagProbe(page);
    await mockScheduleApi(page, async (route) => {
      // Outlast the client timeout, but release the handler so fixture teardown
      // can finish after the browser aborts its request.
      await new Promise((resolve) => setTimeout(resolve, 20_000));
      await route.fulfill({ status: 201, contentType: "application/json",
        body: JSON.stringify({ success: true }) }).catch(() => {});
    });

    await openContactStep(page, "/schedule");
    await page
      .getByRole("button", { name: "Send Appointment Request", exact: true })
      .click();
    await expect(page.getByText("Sending request...")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Try Sending Again", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Sending request...")).toHaveCount(0);
    expect(await countGtagEvents(page, "generate_lead")).toBe(0);
  });

  test("S3/SF2: honeypot ack is confirmation without lead or success events", async ({
    page,
  }) => {
    await installGtagProbe(page);
    await mockScheduleApi(page, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, accepted: false }),
      });
    });

    await openContactStep(page, "/invisalign-consult");
    await page
      .getByRole("button", { name: "Send Appointment Request", exact: true })
      .click();

    await expect(
      page.getByRole("heading", { name: /We'll confirm your appointment shortly\.|Your consultation request was sent\./ }),
    ).toBeVisible();
    expect(await countGtagEvents(page, "generate_lead")).toBe(0);
    expect(await countGtagEvents(page, "schedule_submit_success")).toBe(0);
    expect(await countGtagEvents(page, "schedule_submit")).toBe(0);
    expect(await countGtagEvents(page, "schedule_submit_invisalign")).toBe(0);
  });

  test("S6: /invisalign-consult posts invisalign_consult and names the lead the same", async ({
    page,
  }) => {
    await installGtagProbe(page);
    let postedSource = "";
    await mockScheduleApi(page, async (route) => {
      const payload = route.request().postDataJSON() as { source?: string };
      postedSource = payload.source ?? "";
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await openContactStep(page, "/invisalign-consult");
    await page
      .getByRole("button", { name: "Send Appointment Request", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: /We'll confirm your appointment shortly\.|Your consultation request was sent\./ }),
    ).toBeVisible();

    expect(postedSource).toBe("invisalign_consult");
    expect(await readGenerateLeadFormNames(page)).toEqual(["invisalign_consult"]);
  });

  test("SF4: 429 shows the server message and disables retry until Retry-After", async ({
    page,
  }) => {
    await installGtagProbe(page);
    let requestCount = 0;
    await mockScheduleApi(page, async (route) => {
      requestCount += 1;
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        headers: { "Retry-After": "600" },
        body: JSON.stringify({
          message:
            "Too many requests. Please wait a few minutes and try again, or call the office.",
        }),
      });
    });

    await openContactStep(page, "/schedule");
    await page.clock.install();
    await page
      .getByRole("button", { name: "Send Appointment Request", exact: true })
      .click();

    await expect(page.getByText("Too many requests.")).toBeVisible();
    const retry = page.getByRole("button", { name: "Try Sending Again", exact: true });
    await expect(retry).toBeDisabled();
    await expect(page.getByRole("button", { name: /^back$/i })).toBeEnabled();

    await retry.evaluate((button) => {
      (button as HTMLButtonElement).form?.requestSubmit();
    });
    await page.getByLabel("First name").press("Enter");
    expect(requestCount, "rateLimited guard must drop requestSubmit/Enter").toBe(1);

    await page.getByLabel("First name").fill("Jordan");
    await expect(page.getByLabel("First name")).toHaveValue("Jordan");
    await expect(page.getByText("Too many requests.")).toBeVisible();
    await expect(retry).toBeDisabled();

    await page.getByRole("button", { name: /^back$/i }).click();
    await expect(
      page.getByRole("button", { name: /continue to contact details/i }),
    ).toBeEnabled();
    expect(await countGtagEvents(page, "generate_lead")).toBe(0);
    await page.getByRole("button", { name: /continue to contact details/i }).click();
    await expect(retry).toBeDisabled();

    await page.clock.fastForward(600_000);
    await expect(retry).toBeEnabled();
    expect(requestCount).toBe(1);
  });

  test("form posts source and sourceUrl on /schedule", async ({ page }) => {
    let posted: { source?: string; sourceUrl?: string } = {};
    await mockScheduleApi(page, async (route) => {
      posted = route.request().postDataJSON() as typeof posted;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await openContactStep(page, "/schedule");
    await page
      .getByRole("button", { name: "Send Appointment Request", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: /We'll confirm your appointment shortly\.|Your consultation request was sent\./ }),
    ).toBeVisible();
    expect(posted.source).toBe("schedule_page_form_v2");
    expect(posted.sourceUrl).toMatch(/\/schedule/);
  });
});
