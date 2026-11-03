import { test, expect, type Locator } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

type OverflowState = {
  readonly text: string;
  readonly scrollWidth: number;
  readonly clientWidth: number;
  readonly textOverflow: string;
  readonly overflowX: string;
};

async function overflowState(locator: Locator): Promise<OverflowState> {
  return locator.evaluate((el) => {
    const measure = (node: Element) => {
      const style = getComputedStyle(node);
      return {
        scrollWidth: node.scrollWidth,
        clientWidth: node.clientWidth,
        textOverflow: style.textOverflow,
        overflowX: style.overflowX,
      };
    };
    // Inline text nodes report 0x0; inherited nowrap is not an overflow box.
    // Prefer the ancestor that actually clips or ellipsizes.
    let target: Element = el;
    for (let node: Element | null = el; node && node !== document.body; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (
        node.clientWidth > 0 &&
        (style.textOverflow === "ellipsis" || style.overflowX === "hidden")
      ) {
        target = node;
        break;
      }
      if (node.clientWidth > 0) target = node;
    }
    return {
      text: (el.textContent ?? "").trim(),
      ...measure(target),
    };
  });
}

function assertSublineFits(state: OverflowState, expectedText: string, label: string): void {
  expect(state.text, `${label} text`).toBe(expectedText);
  expect(
    state.scrollWidth,
    `${label} scrollWidth ${state.scrollWidth} must fit clientWidth ${state.clientWidth}`,
  ).toBeLessThanOrEqual(state.clientWidth);
  expect(state.textOverflow, `${label} must not ellipsize`).not.toBe("ellipsis");
}

test("main header phone stays on one line and the subline is full at 1440", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoAndHydrate(page, "/");

  const phone = page.locator('header a[data-analytics-context="header-call"]');
  await expect(phone).toBeVisible();
  await expect(phone).toContainText("(650) 326-6319");
  await expect(phone).toHaveCSS("white-space", "nowrap");
  const phoneBox = await phone.boundingBox();
  expect(phoneBox, "header phone should be laid out").toBeTruthy();
  expect(phoneBox?.height ?? 0).toBeLessThanOrEqual(44);

  const subline = page.locator("header").getByText("Family & Cosmetic Dentistry · Palo Alto");
  await expect(subline).toBeVisible();
  assertSublineFits(
    await overflowState(subline),
    "Family & Cosmetic Dentistry · Palo Alto",
    "1440 subline",
  );
});

test("1280 and 1024 use the compact subline instead of a mid-line ellipsis", async ({
  page,
}) => {
  for (const width of [1280, 1024] as const) {
    await page.setViewportSize({ width, height: 800 });
    await gotoAndHydrate(page, "/");
    const short = page
      .locator("header")
      .getByText("Palo Alto Dentistry", { exact: true })
      .locator("visible=true");
    await expect(short).toHaveCount(1);
    assertSublineFits(await overflowState(short), "Palo Alto Dentistry", `${width} compact subline`);
    await expect(
      page.locator("header").getByText("Family & Cosmetic Dentistry · Palo Alto"),
    ).toBeHidden();
  }
});

test("390 compact header still shows the short subline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoAndHydrate(page, "/");

  const compact = page
    .locator("header")
    .getByText("Palo Alto Dentistry", { exact: true })
    .locator("visible=true");
  await expect(compact).toHaveCount(1);
  await expect(page.locator("header").getByText("Family & Cosmetic Dentistry · Palo Alto")).toBeHidden();
  await expect(page.locator('header a[data-analytics-context="header-call"]')).toBeHidden();
});
