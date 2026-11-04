import { test, expect, type ConsoleMessage, type Page, type Request } from "@playwright/test";

const GOOGLE_HOST_SUFFIXES = [
  "googletagmanager.com",
  "google-analytics.com",
  "googletagservices.com",
  "doubleclick.net",
] as const;

function isGoogleMeasurementUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  const host = parsed.hostname.toLowerCase();
  if (
    GOOGLE_HOST_SUFFIXES.some((root) => host === root || host.endsWith(`.${root}`))
  ) {
    return true;
  }
  if (!parsed.pathname.includes("/pagead")) return false;
  return (
    host === "google.com" ||
    host.endsWith(".google.com") ||
    /^([a-z0-9-]+\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host)
  );
}

let googleCompletedHits: string[] = [];
let googleCollectHits: string[] = [];

function isGoogleCollectUrl(rawUrl: string): boolean {
  if (!isGoogleMeasurementUrl(rawUrl)) return false;
  try {
    const path = new URL(rawUrl).pathname;
    return (
      path === "/collect" ||
      path.endsWith("/collect") ||
      path.includes("/g/collect") ||
      path.includes("/r/collect") ||
      path.includes("/j/collect")
    );
  } catch {
    return false;
  }
}

// Every production-origin GET is served from localhost. POSTs and vendor
// requests are intercepted: these checks never send a lead or collect event.
test.beforeEach(async ({ page, context, baseURL }) => {
  googleCompletedHits = [];
  googleCollectHits = [];
  context.on("request", (request) => {
    if (isGoogleCollectUrl(request.url())) {
      googleCollectHits.push(request.url());
    }
  });
  context.on("requestfinished", (request) => {
    if (isGoogleMeasurementUrl(request.url())) {
      googleCompletedHits.push(request.url());
    }
  });
  await context.route("**/*", async (route) => {
    if (isGoogleMeasurementUrl(route.request().url())) {
      await route.abort();
      return;
    }
    const url = new URL(route.request().url());
    if (url.hostname !== "www.chriswongdds.com" || route.request().method() !== "GET") {
      await route.abort();
      return;
    }
    if (route.request().headers()["next-router-prefetch"] === "1") {
      await route.abort();
      return;
    }
    try {
      const response = await route.fetch({
        url: `${baseURL}${url.pathname}${url.search}`,
        timeout: 10_000,
      });
      await route.fulfill({ response });
    } catch {
      await route.abort().catch(() => {});
    }
  });
  await page.addInitScript(() => {
    window.dataLayer = [];
    window.gtag = (...args: unknown[]) => {
      const events = JSON.parse(sessionStorage.getItem("contact-test-events") ?? "[]");
      events.push(args);
      sessionStorage.setItem("contact-test-events", JSON.stringify(events));
      window.dataLayer = window.dataLayer ?? [];
      window.dataLayer.push(args);
    };
    try {
      window.localStorage.setItem("analytics_consent", "granted");
    } catch {
      // ignore
    }
  });
});

test.afterEach(async ({ page, context }) => {
  await context.unrouteAll({ behavior: "ignoreErrors" }).catch(() => {});
  await page.unrouteAll({ behavior: "ignoreErrors" });
});

async function gotoContact(page: Page): Promise<void> {
  const testInfo = test.info();
  const nameField = page.getByLabel("Full name", { exact: true });
  const failedRequests: string[] = [];
  const consoleErrors: string[] = [];
  const onFailed = (request: Request): void => {
    failedRequests.push(`${request.failure()?.errorText ?? "failed"} ${request.url()}`);
  };
  const onConsole = (message: ConsoleMessage): void => {
    if (message.type() === "error") consoleErrors.push(message.text());
  };

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    if (attempt === 1) {
      page.on("requestfailed", onFailed);
      page.on("console", onConsole);
    }
    const started = Date.now();
    await page.goto("https://www.chriswongdds.com/contact", { waitUntil: "domcontentloaded" });
    try {
      await nameField.waitFor({ state: "visible", timeout: 15_000 });
      page.off("requestfailed", onFailed);
      page.off("console", onConsole);
      return;
    } catch (error) {
      const waitedMs = Date.now() - started;
      page.off("requestfailed", onFailed);
      page.off("console", onConsole);
      if (attempt === 1) {
        testInfo.annotations.push({
          type: "hydration-retry",
          description: `attempt 1 missed Full name after ${waitedMs}ms. failedRequests=${JSON.stringify(failedRequests)} consoleErrors=${JSON.stringify(consoleErrors)}`,
        });
      }
      if (attempt === 2) throw error;
    }
  }
}

async function submitContact(page: Page): Promise<void> {
  await gotoContact(page);
  await page.getByLabel("Full name", { exact: true }).fill("Contact Example");
  await page.getByLabel("Email address", { exact: true }).fill("contact.example@example.com");
  await page.getByLabel("Phone number", { exact: true }).fill("6505550100");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Services and treatment options", exact: true }).click();
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("Synthetic intercepted browser check.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send message", exact: true }).click();
}

async function eventEntries(page: Page): Promise<unknown[][]> {
  return page.evaluate(() => {
    return JSON.parse(sessionStorage.getItem("contact-test-events") ?? "[]") as unknown[][];
  });
}

async function eventNames(page: Page): Promise<string[]> {
  const events = await eventEntries(page);
  return events.filter((args) => args[0] === "event").map((args) => String(args[1]));
}

async function generateLeadPayloads(page: Page): Promise<Array<Record<string, unknown>>> {
  const events = await eventEntries(page);
  return events
    .filter((args) => args[0] === "event" && args[1] === "generate_lead")
    .map((args) =>
      args[2] && typeof args[2] === "object"
        ? (args[2] as Record<string, unknown>)
        : {},
    );
}

function assertGoogleHostsBlocked(): void {
  expect(
    googleCompletedHits,
    `Completed Google measurement requests:\n${googleCompletedHits.join("\n")}`,
  ).toEqual([]);
  expect(
    googleCollectHits,
    `Google collect requests:\n${googleCollectHits.join("\n")}`,
  ).toEqual([]);
}

test("contact honeypot acknowledgement stays quiet without a lead", async ({ page }) => {
  await page.route("**/api/contact", (route) => route.fulfill({
    status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, accepted: false }),
  }));
  await submitContact(page);
  await expect(page.getByRole("status").filter({ hasText: /^Message sent\.$/ })).toBeVisible();
  await page.waitForTimeout(600);
  expect(page.url()).toMatch(/\/contact$/);
  expect(await eventNames(page)).not.toContain("generate_lead");
  expect(await eventNames(page)).not.toContain("contact_form_submit");
  assertGoogleHostsBlocked();
});

test("an explicit accepted contact emits generate_lead once with the main payload", async ({ page }) => {
  const posts: Array<Record<string, unknown>> = [];
  await page.route("**/api/contact", async (route) => {
    posts.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({
      status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, accepted: true }),
    });
  });
  await submitContact(page);
  await expect(page).toHaveURL(/\/thank-you$/);
  expect(posts).toHaveLength(1);
  expect(posts[0]?.company).toBe("");
  const names = await eventNames(page);
  expect(names.filter((name) => name === "generate_lead")).toHaveLength(1);
  expect(names.filter((name) => name === "contact_form_submit")).toHaveLength(1);
  const payloads = await generateLeadPayloads(page);
  expect(payloads).toHaveLength(1);
  expect(payloads[0]).toMatchObject({
    form_name: "contact_form",
    lead_type: "contact_request",
    lead_source: "contact_form",
    page_path: "/contact",
    page_category: "trust",
  });
  expect(typeof payloads[0]?.lead_channel).toBe("string");
  assertGoogleHostsBlocked();
});

test("a network abort does not fire generate_lead", async ({ page }) => {
  await page.route("**/api/contact", (route) => route.abort());
  await submitContact(page);
  await expect(page.getByRole("alert").filter({ hasText: /we could not send your message/i })).toBeVisible();
  expect(await eventNames(page)).not.toContain("generate_lead");
  expect(await eventNames(page)).not.toContain("contact_form_submit");
  assertGoogleHostsBlocked();
});

test("a double click posts once and emits each lead event once", async ({ page }) => {
  let posts = 0;
  await page.route("**/api/contact", async (route) => {
    posts += 1;
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, accepted: true }),
    });
  });
  await gotoContact(page);
  await page.getByLabel("Full name", { exact: true }).fill("Contact Example");
  await page.getByLabel("Email address", { exact: true }).fill("contact.example@example.com");
  await page.getByLabel("Phone number", { exact: true }).fill("6505550100");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Services and treatment options", exact: true }).click();
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("Synthetic intercepted browser check.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send message", exact: true }).dblclick();
  await expect(page).toHaveURL(/\/thank-you$/);
  expect(posts).toBe(1);
  const names = await eventNames(page);
  expect(names.filter((name) => name === "generate_lead")).toHaveLength(1);
  expect(names.filter((name) => name === "contact_form_submit")).toHaveLength(1);
  assertGoogleHostsBlocked();
});

test("a filled honeypot does not POST or fire generate_lead", async ({ page }) => {
  let posted = false;
  await page.route("**/api/contact", async (route) => {
    posted = true;
    await route.fulfill({
      status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, accepted: true }),
    });
  });
  await gotoContact(page);
  await page.getByLabel("Full name", { exact: true }).fill("Contact Example");
  await page.getByLabel("Email address", { exact: true }).fill("contact.example@example.com");
  await page.getByLabel("Phone number", { exact: true }).fill("6505550100");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Services and treatment options", exact: true }).click();
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("Synthetic intercepted browser check.");
  await page.getByRole("checkbox").check();
  await page.locator("#contact-company").evaluate((el) => {
    (el as HTMLInputElement).value = "Acme Bot Corp";
  });
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: /^Message sent\.$/ })).toBeVisible();
  expect(posted, "a filled honeypot must not POST /api/contact").toBe(false);
  expect(await eventNames(page)).not.toContain("generate_lead");
  expect(await eventNames(page)).not.toContain("contact_form_submit");
  assertGoogleHostsBlocked();
});

test("a hung contact POST times out then retry emits generate_lead once", async ({
  page,
}) => {
  test.setTimeout(60_000);
  let attempts = 0;
  await page.route("**/api/contact", async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await new Promise(() => {
        // Stay pending past the timeout copy. afterEach unrouteAll releases this.
      });
      return;
    }
    await route.fulfill({
      status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, accepted: true }),
    });
  });
  await submitContact(page);
  const errorAlert = page.getByRole("alert").filter({ hasText: /we could not send your message/i });
  await expect(errorAlert).toBeVisible({ timeout: 25_000 });
  await expect(errorAlert).toContainText(/the request took too long/i);
  expect(await eventNames(page)).not.toContain("generate_lead");
  expect(await eventNames(page)).not.toContain("contact_form_submit");
  // Drop the hanging route so later specs (and the retry) are independent of it.
  await page.unroute("**/api/contact");
  await page.route("**/api/contact", async (route) => {
    attempts += 1;
    await route.fulfill({
      status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, accepted: true }),
    });
  });
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page).toHaveURL(/\/thank-you$/);
  expect(attempts).toBe(2);
  const names = await eventNames(page);
  expect(names.filter((name) => name === "generate_lead")).toHaveLength(1);
  expect(names.filter((name) => name === "contact_form_submit")).toHaveLength(1);
  assertGoogleHostsBlocked();
});

test("a slow first contact form chunk is annotated on retry", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  let delayedUrl: string | undefined;
  await page.route("**/_next/static/**", async (route) => {
    const url = route.request().url();
    if (!delayedUrl && /\/_next\/static\/chunks\/app\/contact\//i.test(url)) {
      delayedUrl = url;
      await new Promise((resolve) => setTimeout(resolve, 20_000));
    }
    await route.fallback();
  });
  await gotoContact(page);
  const retry = testInfo.annotations.find((annotation) => annotation.type === "hydration-retry");
  expect(
    retry,
    `20s first-load contact page chunk delay must be annotated, not hidden. delayed=${delayedUrl ?? "none"}`,
  ).toBeTruthy();
  expect(retry?.description ?? "").toMatch(/attempt 1 missed Full name after 1[5-9]\d{3}ms/);
});

test("contact submit still works when AbortSignal.timeout is missing", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const signal = AbortSignal as typeof AbortSignal & { timeout?: unknown };
    delete signal.timeout;
  });
  let posts = 0;
  await page.route("**/api/contact", async (route) => {
    posts += 1;
    await route.fulfill({
      status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, accepted: true }),
    });
  });
  await submitContact(page);
  await expect(page).toHaveURL(/\/thank-you$/);
  expect(posts, "old browsers must still POST /api/contact").toBe(1);
  const names = await eventNames(page);
  expect(names.filter((name) => name === "generate_lead")).toHaveLength(1);
  expect(names.filter((name) => name === "contact_form_submit")).toHaveLength(1);
  assertGoogleHostsBlocked();
});

test("an abort then retry emits generate_lead once", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/contact", async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.abort();
      return;
    }
    await route.fulfill({
      status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, accepted: true }),
    });
  });
  await submitContact(page);
  const errorAlert = page.getByRole("alert").filter({ hasText: /we could not send your message/i });
  await expect(errorAlert).toBeVisible();
  await expect(errorAlert).toContainText(/the request took too long/i);
  expect(await eventNames(page)).not.toContain("generate_lead");
  expect(await eventNames(page)).not.toContain("contact_form_submit");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page).toHaveURL(/\/thank-you$/);
  expect(attempts).toBe(2);
  const names = await eventNames(page);
  expect(names.filter((name) => name === "generate_lead")).toHaveLength(1);
  expect(names.filter((name) => name === "contact_form_submit")).toHaveLength(1);
  assertGoogleHostsBlocked();
});

test("a validation error does not fire generate_lead", async ({ page }) => {
  let posted = false;
  await page.route("**/api/contact", async (route) => {
    posted = true;
    await route.abort();
  });
  await gotoContact(page);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: /please review the highlighted fields/i }),
  ).toBeVisible();
  expect(posted, "validation miss must not POST the contact backend").toBe(false);
  expect(await eventNames(page)).not.toContain("generate_lead");
  expect(await eventNames(page)).not.toContain("contact_form_submit");
  assertGoogleHostsBlocked();
});

for (const flag of ["preview", "test"] as const) {
  test(`contact ${flag} acknowledgement cannot create a lead even with accepted true`, async ({ page }, testInfo) => {
    await page.route("**/api/contact", (route) => route.fulfill({
      status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, accepted: true, [flag]: true }),
    }));
    await submitContact(page);
    await expect(page.getByRole("status").filter({ hasText: /nothing was sent/i })).toBeVisible();
    if (flag === "preview") {
      await page.getByRole("status").filter({ hasText: /nothing was sent/i }).screenshot({ path: testInfo.outputPath("contact-demo-status.png") });
    }
    await page.waitForTimeout(600);
    expect(page.url()).toMatch(/\/contact$/);
    expect(await eventNames(page)).not.toContain("generate_lead");
    expect(await eventNames(page)).not.toContain("contact_form_submit");
    assertGoogleHostsBlocked();
  });
}

for (const [name, status, body] of [
  ["rejected HTTP", 500, JSON.stringify({ ok: true, accepted: true })],
  ["rejected JSON", 200, JSON.stringify({ ok: false, accepted: true })],
  ["ambiguous legacy success", 201, JSON.stringify({ ok: true })],
  ["provider response without server acceptance", 201, JSON.stringify({ next: "test-redirect-url" })],
  ["HTML success", 200, "<html>Not accepted</html>"],
] as const) {
  test(`contact ${name} does not create a lead or discard entries`, async ({ page }) => {
    await page.route("**/api/contact", (route) => route.fulfill({ status, contentType: "application/json", body }));
    await submitContact(page);
    await expect(page.getByRole("alert").filter({ hasText: /we could not send your message/i })).toBeVisible();
    await expect(page.getByLabel("Full name", { exact: true })).toHaveValue("Contact Example");
    expect(await eventNames(page)).not.toContain("generate_lead");
    expect(await eventNames(page)).not.toContain("contact_form_submit");
    assertGoogleHostsBlocked();
  });
}
