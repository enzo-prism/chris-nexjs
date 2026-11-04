import { test, expect, type Locator } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

type ClipperState = {
  readonly overflowX: string;
  readonly overflowY: string;
  readonly textOverflow: string;
  readonly clipPath: string;
  readonly scrollWidth: number;
  readonly clientWidth: number;
  readonly scrollHeight: number;
  readonly clientHeight: number;
  readonly textLeft: number;
  readonly textRight: number;
  readonly textTop: number;
  readonly textBottom: number;
  readonly clipLeft: number;
  readonly clipRight: number;
  readonly clipTop: number;
  readonly clipBottom: number;
};

type OverflowState = {
  readonly text: string;
  readonly clippers: readonly ClipperState[];
};

async function overflowState(locator: Locator): Promise<OverflowState> {
  return locator.evaluate((el) => {
    const isNonVisible = (value: string): boolean =>
      value === "hidden" || value === "clip" || value === "auto";
    const header = el.closest("header");
    const textBox = el.getBoundingClientRect();
    const clippers: ClipperState[] = [];
    for (
      let node: Element | null = el;
      node;
      node = node.parentElement
    ) {
      const style = getComputedStyle(node);
      const clipsOverflow =
        isNonVisible(style.overflowX) || isNonVisible(style.overflowY);
      const hasClipPath = style.clipPath !== "none";
      if (
        (clipsOverflow || hasClipPath) &&
        (node.clientWidth > 0 || node.clientHeight > 0)
      ) {
        const clipBox = node.getBoundingClientRect();
        clippers.push({
          overflowX: style.overflowX,
          overflowY: style.overflowY,
          textOverflow: style.textOverflow,
          clipPath: style.clipPath,
          scrollWidth: node.scrollWidth,
          clientWidth: node.clientWidth,
          scrollHeight: node.scrollHeight,
          clientHeight: node.clientHeight,
          textLeft: textBox.left,
          textRight: textBox.right,
          textTop: textBox.top,
          textBottom: textBox.bottom,
          clipLeft: clipBox.left,
          clipRight: clipBox.right,
          clipTop: clipBox.top,
          clipBottom: clipBox.bottom,
        });
      }
      if (node === header || node.tagName === "HEADER") break;
    }
    return {
      text: (el.textContent ?? "").trim(),
      clippers,
    };
  });
}

function assertSublineFits(state: OverflowState, expectedText: string, label: string): void {
  expect(state.text, `${label} text`).toBe(expectedText);
  for (const clipper of state.clippers) {
    expect(
      clipper.scrollWidth,
      `${label} overflow:${clipper.overflowX}/${clipper.overflowY} scrollWidth ${clipper.scrollWidth} must fit clientWidth ${clipper.clientWidth}`,
    ).toBeLessThanOrEqual(clipper.clientWidth);
    expect(
      clipper.scrollHeight,
      `${label} overflow:${clipper.overflowX}/${clipper.overflowY} scrollHeight ${clipper.scrollHeight} must fit clientHeight ${clipper.clientHeight}`,
    ).toBeLessThanOrEqual(clipper.clientHeight);
    expect(clipper.textOverflow, `${label} ancestor must not ellipsize`).not.toBe("ellipsis");
    expect(clipper.clipPath, `${label} ancestor must not clip-path`).toBe("none");
    expect(
      clipper.textLeft,
      `${label} text left ${clipper.textLeft} must stay inside clip left ${clipper.clipLeft}`,
    ).toBeGreaterThanOrEqual(clipper.clipLeft - 0.5);
    expect(
      clipper.textRight,
      `${label} text right ${clipper.textRight} must stay inside clip right ${clipper.clipRight}`,
    ).toBeLessThanOrEqual(clipper.clipRight + 0.5);
    expect(
      clipper.textTop,
      `${label} text top ${clipper.textTop} must stay inside clip top ${clipper.clipTop}`,
    ).toBeGreaterThanOrEqual(clipper.clipTop - 0.5);
    expect(
      clipper.textBottom,
      `${label} text bottom ${clipper.textBottom} must stay inside clip bottom ${clipper.clipBottom}`,
    ).toBeLessThanOrEqual(clipper.clipBottom + 0.5);
  }
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
  assertSublineFits(await overflowState(compact), "Palo Alto Dentistry", "390 compact subline");
  await expect(page.locator("header").getByText("Family & Cosmetic Dentistry · Palo Alto")).toBeHidden();
  await expect(page.locator('header a[data-analytics-context="header-call"]')).toBeHidden();
});
