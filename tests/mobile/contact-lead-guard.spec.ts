import { test, expect, type Page } from "@playwright/test";

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

async function submitContact(page: Page): Promise<void> {
  await page.goto("https://www.chriswongdds.com/contact", { waitUntil: "networkidle" });
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
  await page.goto("https://www.chriswongdds.com/contact", { waitUntil: "networkidle" });
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

test("a filled honeypot does not fire generate_lead", async ({ page }) => {
  await page.route("**/api/contact", (route) => route.fulfill({
    status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, accepted: false }),
  }));
  await page.goto("https://www.chriswongdds.com/contact", { waitUntil: "networkidle" });
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
  expect(await eventNames(page)).not.toContain("generate_lead");
  expect(await eventNames(page)).not.toContain("contact_form_submit");
  assertGoogleHostsBlocked();
});

test("a validation error does not fire generate_lead", async ({ page }) => {
  let posted = false;
  await page.route("**/api/contact", async (route) => {
    posted = true;
    await route.abort();
  });
  await page.goto("https://www.chriswongdds.com/contact", { waitUntil: "networkidle" });
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
