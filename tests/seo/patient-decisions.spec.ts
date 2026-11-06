import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  // These UI checks must never submit an inquiry or emit acquisition telemetry,
  // including if the suite is intentionally pointed at a hosted deployment.
  await context.route(/google-analytics\.com|googletagmanager\.com|hotjar\.(?:com|io)|vercel-insights\.com|\/_vercel\/(?:insights|speed-insights)|\/api\/(?:contact|schedule-request|newsletter)|formspree\.io/, (route) => route.abort());
});

test("decision guides work without JavaScript and do not overflow", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: testInfo.project.use.viewport,
  });
  const page = await context.newPage();
  try {
    for (const [path, id] of [["/", "home-decision-guides"], ["/services", "services-decision-guides"]]) {
      const response = await page.goto(`${baseURL}${path}`);
      expect(response?.status(), `Expected a real page at ${path}`).toBe(200);
      const guides = page.locator(`#${id}`);
      await expect(guides.getByRole("link", { name: "How long does Invisalign take?" })).toHaveAttribute("href", "/blog/how-long-does-invisalign-take");
      await expect(guides.getByRole("link", { name: "Veneer options", exact: true })).toHaveAttribute("href", "/dental-veneers");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await guides.screenshot({ path: testInfo.outputPath(`${id}.png`) });
    }
  } finally {
    await context.close();
  }
});

test("practice decision answers match their structured data", async ({ page }, testInfo) => {
  const cases = [
    { path: "/invisalign", question: "Are refinements and retainers included in my Invisalign fee?", answer: "individual written estimate", costId: "invisalign-cost", intent: "invisalign" },
    { path: "/emergency-dental", question: "Does an online request confirm a same-day emergency appointment?", answer: "office must confirm the visit time", costId: "emergency-cost", intent: "emergency" },
    { path: "/dental-implants", question: "Who places the implant and who restores my tooth?", answer: "Trusted surgical partners perform implant placement", costId: "implants-cost", intent: "implants" },
  ];
  for (const entry of cases) {
    const response = await page.goto(entry.path);
    expect(response?.status(), `Expected a real page at ${entry.path}`).toBe(200);
    const detail = page.locator("details").filter({ has: page.getByRole("heading", { name: entry.question, exact: true }) });
    if (!(await detail.getAttribute("open"))) {
      // An open boolean attribute can be the empty string; inspect the property.
      const open = await detail.evaluate((element) => (element as HTMLDetailsElement).open);
      if (!open) await detail.locator("summary").click();
    }
    await expect(detail.locator(".prose-rooted")).toBeVisible();
    await expect(detail).toContainText(entry.answer);
    const answers = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => {
      const nodes = scripts.flatMap((script) => JSON.parse(script.textContent || "{}"));
      return nodes.filter((node) => node["@type"] === "FAQPage").flatMap((node) => node.mainEntity);
    });
    const answer = answers.find((item) => item.name === entry.question);
    expect(answer?.acceptedAnswer.text).toContain(entry.answer);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    const cost = page.locator(`#${entry.costId}`);
    await expect(cost).toBeVisible();
    await expect(cost.locator(`a[href*="intent=${entry.intent}"]`).first()).toHaveAttribute("href", /\/schedule\?intent=/);
    await cost.screenshot({ path: testInfo.outputPath(`${entry.costId}.png`) });
  }
});

test("article sources are visible and editorial changes do not imply clinical review", async ({ page }) => {
  const response = await page.goto("/blog/how-long-does-invisalign-take");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("How Long Does Invisalign Take in Palo Alto?");
  const sources = page.getByRole("complementary", { name: "Sources and further reading" });
  await expect(sources.getByRole("link", { name: /How Invisalign treatment works/ })).toHaveAttribute("href", "https://www.invisalign.com/how-it-works");
  await expect(page.locator("article header")).toContainText("Published March 14, 2026");
  await expect(page.locator("article header")).toContainText("Updated November 6, 2026");
  await expect(page.locator("article header")).not.toContainText("Clinically reviewed");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
