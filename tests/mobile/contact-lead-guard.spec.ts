import { test, expect, type Page } from "@playwright/test";

// Every production-origin GET is served from localhost. POSTs and vendor
// requests are intercepted: these checks never send a lead or collect event.
test.beforeEach(async ({ page, baseURL }) => {
  await page.route("**/*", async (route) => {
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
      const response = await route.fetch({ url: `${baseURL}${url.pathname}${url.search}`, timeout: 10_000 });
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
    };
  });
});

test.afterEach(async ({ page }) => {
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

async function eventNames(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const events: unknown[][] = JSON.parse(sessionStorage.getItem("contact-test-events") ?? "[]");
    return events.filter((args) => args[0] === "event").map((args) => String(args[1]));
  });
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
});

test("an explicit accepted contact emits each acquisition event once", async ({ page }) => {
  await page.route("**/api/contact", (route) => route.fulfill({
    status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, accepted: true }),
  }));
  await submitContact(page);
  await expect(page).toHaveURL(/\/thank-you$/);
  const names = await eventNames(page);
  expect(names.filter((name) => name === "generate_lead")).toHaveLength(1);
  expect(names.filter((name) => name === "contact_form_submit")).toHaveLength(1);
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
  });
}
