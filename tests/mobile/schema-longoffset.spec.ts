import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";
import { isValidIsoDateTime } from "../../shared/isoDateTime";

test("gallery and blog still render when longOffset is rejected", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const Original = Intl.DateTimeFormat;
    const Stub = function (
      this: unknown,
      locales?: string | string[],
      options?: Intl.DateTimeFormatOptions,
    ) {
      if (options?.timeZoneName === "longOffset") {
        throw new RangeError("Invalid option : longOffset");
      }
      return new Original(locales, options);
    } as unknown as typeof Intl.DateTimeFormat;
    Object.defineProperty(Stub, "supportedLocalesOf", {
      value: Original.supportedLocalesOf.bind(Original),
    });
    Intl.DateTimeFormat = Stub;
  });

  const pageErrors: string[] = [];
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  for (const path of ["/gallery", "/blog"] as const) {
    await gotoAndHydrate(page, path);
    await expect(page.locator("main")).toBeVisible();
    expect(pageErrors, `${path} threw with longOffset stubbed`).toEqual([]);

    const values = await page.evaluate(() => {
      const found: string[] = [];
      const visit = (node: unknown): void => {
        if (!node || typeof node !== "object") return;
        if (Array.isArray(node)) {
          node.forEach(visit);
          return;
        }
        const record = node as Record<string, unknown>;
        for (const key of ["datePublished", "dateModified", "uploadDate"] as const) {
          if (typeof record[key] === "string") found.push(record[key]);
        }
        Object.values(record).forEach(visit);
      };
      for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
        try {
          visit(JSON.parse(script.textContent ?? ""));
        } catch {
          // ignore malformed blocks
        }
      }
      return found;
    });
    expect(values.length, `${path} JSON-LD dates`).toBeGreaterThan(0);
    for (const value of values) {
      expect(isValidIsoDateTime(value), `${path} ${value}`).toBe(true);
    }
  }
});
