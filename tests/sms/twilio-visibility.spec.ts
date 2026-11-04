import { existsSync, mkdirSync } from "node:fs";

import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  SMS_PRIVACY_NO_MARKETING_SHARE,
  SMS_PRIVACY_SHARING_EXCLUSION,
  SMS_PRIVACY_SUBCONTRACTOR_SHARING,
} from "../../shared/sms";

const RUNS = [
  { path: "/privacy-policy", sectionId: "sharing", label: "Privacy #sharing" },
  { path: "/privacy-policy", sectionId: "text-messaging", label: "Privacy Text Messaging" },
  { path: "/sms-terms", sectionId: "mobile-numbers", label: "/sms-terms #mobile-numbers" },
] as const;

const SHOT_DIR = existsSync("/opt/cursor/artifacts")
  ? "/opt/cursor/artifacts"
  : "test-results/sms-visibility";

const MIN_BOX_PX = 1;
const MIN_REASONABLE_HEIGHT = 8;

type Readability = {
  ok: boolean;
  reasons: string[];
  width: number;
  height: number;
  innerText: string;
};

async function gotoLegal(page: Page, path: string): Promise<void> {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response?.status(), `${path} did not return 200`).toBe(200);
  await page
    .waitForLoadState("networkidle", { timeout: 8_000 })
    .catch(() => {
      /* analytics may keep the network busy */
    });
}

async function runLocator(page: Page, sectionId: string): Promise<Locator> {
  const section = page.locator(`section#${sectionId}`);
  await expect(section, `missing section #${sectionId}`).toHaveCount(1);
  return section.locator("p").filter({ hasText: SMS_PRIVACY_NO_MARKETING_SHARE }).first();
}

async function scrollRun(locator: Locator): Promise<void> {
  await locator.evaluate((el) => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    el.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
    root.style.scrollBehavior = previous;
  });
  await locator.scrollIntoViewIfNeeded();
}

async function collectReadability(locator: Locator): Promise<Readability> {
  return locator.evaluate((el) => {
    const reasons: string[] = [];
    const node = el as HTMLElement;
    const box = node.getBoundingClientRect();
    const style = window.getComputedStyle(node);
    const innerText = node.innerText ?? "";
    const fontSize = parseFloat(style.fontSize);
    const opacity = parseFloat(style.opacity);

    if (!(box.width >= 1 && box.height >= 1)) reasons.push("box < 1px");
    if (box.height < 8) reasons.push("height not reasonable");
    if (
      !(
        box.bottom > 0 &&
        box.top < window.innerHeight &&
        box.right > 0 &&
        box.left < window.innerWidth
      )
    ) {
      reasons.push("out of viewport");
    }
    if (!(opacity > 0)) reasons.push("opacity 0");
    if (style.visibility !== "visible") reasons.push(`visibility ${style.visibility}`);
    if (!(fontSize > 0)) reasons.push("font-size 0");
    if ((style.contentVisibility || "visible") === "hidden") reasons.push("content-visibility hidden");

    const clip = style.clip;
    if (clip && clip !== "auto" && clip !== "none") reasons.push(`clip ${clip}`);
    const clipPath = style.clipPath || (style as CSSStyleDeclaration & { webkitClipPath?: string }).webkitClipPath;
    if (clipPath && clipPath !== "none") reasons.push(`clip-path ${clipPath}`);

    const indent = parseFloat(style.textIndent);
    if (Number.isFinite(indent) && Math.abs(indent) >= Math.max(box.width, 1)) {
      reasons.push(`text-indent ${style.textIndent}`);
    }

    const parseAlpha = (value: string): number => {
      const trimmed = value.trim().toLowerCase();
      if (trimmed === "transparent") return 0;
      const slash = trimmed.match(/^rgba?\([^/]+\/\s*([\d.]+%?)\s*\)$/);
      if (slash) {
        const raw = slash[1] ?? "1";
        return raw.endsWith("%") ? parseFloat(raw) / 100 : parseFloat(raw);
      }
      const comma = trimmed.match(
        /^rgba?\(\s*[\d.]+(?:\s*,\s*[\d.]+){2}(?:\s*,\s*([\d.]+%?))?\s*\)$/,
      );
      if (comma) {
        if (!comma[1]) return 1;
        return comma[1].endsWith("%") ? parseFloat(comma[1]) / 100 : parseFloat(comma[1]);
      }
      return 1;
    };
    const textAlpha = parseAlpha(style.color);
    if (textAlpha < 0.5) reasons.push(`color alpha ${textAlpha}`);

    let cumulativeOpacity = Number.isFinite(opacity) ? opacity : 1;
    let ancestor = node.parentElement;
    let ancestorHides = false;
    while (ancestor) {
      const ancestorStyle = window.getComputedStyle(ancestor);
      const ancestorBox = ancestor.getBoundingClientRect();
      const overflowHidden =
        ancestorStyle.overflow === "hidden" ||
        ancestorStyle.overflowX === "hidden" ||
        ancestorStyle.overflowY === "hidden";
      const zeroClip =
        overflowHidden && (ancestorBox.width < 1 || ancestorBox.height < 1);
      const filter = ancestorStyle.filter || "";
      const filterHides =
        filter !== "none" &&
        (/opacity\(\s*0(?:\.0+)?\s*\)/.test(filter) || /blur\(/.test(filter));
      const ariaHidden = ancestor.getAttribute("aria-hidden") === "true";
      if (
        ancestorStyle.display === "none" ||
        ancestorStyle.visibility === "hidden" ||
        ancestorStyle.visibility === "collapse" ||
        parseFloat(ancestorStyle.opacity) === 0 ||
        zeroClip ||
        filterHides ||
        ariaHidden
      ) {
        ancestorHides = true;
        break;
      }
      cumulativeOpacity *= Number.isFinite(parseFloat(ancestorStyle.opacity))
        ? parseFloat(ancestorStyle.opacity)
        : 1;
      ancestor = ancestor.parentElement;
    }
    if (ancestorHides) reasons.push("ancestor conceals");
    if (cumulativeOpacity < 0.5) reasons.push(`cumulative opacity ${cumulativeOpacity}`);

    const rects = node.getClientRects();
    const sampleRect = rects[0] ?? box;
    const points = [
      [sampleRect.left + sampleRect.width / 2, sampleRect.top + sampleRect.height / 2],
      [sampleRect.left + sampleRect.width * 0.25, sampleRect.top + sampleRect.height / 2],
      [sampleRect.left + sampleRect.width * 0.75, sampleRect.top + sampleRect.height / 2],
      [sampleRect.left + sampleRect.width / 2, sampleRect.top + sampleRect.height * 0.25],
      [sampleRect.left + sampleRect.width / 2, sampleRect.top + sampleRect.height * 0.75],
    ];
    for (const [x, y] of points) {
      const hit = document.elementFromPoint(x, y);
      if (!hit || (hit !== node && !node.contains(hit))) {
        reasons.push(`overlay at ${Math.round(x)},${Math.round(y)}`);
        break;
      }
    }

    return {
      ok: reasons.length === 0,
      reasons,
      width: box.width,
      height: box.height,
      innerText,
    };
  });
}

async function assertRunVisible(page: Page, locator: Locator, label: string): Promise<void> {
  await expect(locator, `${label} must be visible`).toBeVisible();
  await scrollRun(locator);
  const metrics = await collectReadability(locator);
  expect(metrics.width, `${label} bounding box width`).toBeGreaterThanOrEqual(MIN_BOX_PX);
  expect(metrics.height, `${label} bounding box height`).toBeGreaterThanOrEqual(MIN_BOX_PX);
  expect(metrics.height, `${label} reasonable height`).toBeGreaterThanOrEqual(MIN_REASONABLE_HEIGHT);
  expect(metrics.ok, `${label} readable: ${metrics.reasons.join("; ")}`).toBe(true);
  expect(metrics.innerText, `${label} must keep the subcontractor sentence`).toContain(
    SMS_PRIVACY_SUBCONTRACTOR_SHARING,
  );
  expect(metrics.innerText, `${label} must keep the exclusion sentence`).toContain(
    SMS_PRIVACY_SHARING_EXCLUSION,
  );
}

async function highlight(locator: Locator): Promise<void> {
  await locator.evaluate((el) => {
    el.setAttribute("data-sms-twilio-run", "1");
    const node = el as HTMLElement;
    node.style.outline = "3px solid #c45c26";
    node.style.outlineOffset = "6px";
    node.style.boxShadow = "0 0 0 10px rgba(196, 92, 38, 0.18)";
    node.style.backgroundColor = "rgba(196, 92, 38, 0.08)";
  });
}

async function shotRun(page: Page, locator: Locator, name: string, width: number): Promise<void> {
  const box = await locator.boundingBox();
  expect(box, `${name} bounding box for screenshot`).toBeTruthy();
  const pad = 18;
  await page.screenshot({
    path: `${SHOT_DIR}/sms-twilio-${name}-${width}.png`,
    clip: {
      x: Math.max(0, (box?.x ?? 0) - pad),
      y: Math.max(0, (box?.y ?? 0) - pad),
      width: (box?.width ?? 0) + pad * 2,
      height: (box?.height ?? 0) + pad * 2,
    },
  });
}

test("the three Twilio runs are readable at this viewport", async ({ page }) => {
  const width = page.viewportSize()?.width ?? 0;
  mkdirSync(SHOT_DIR, { recursive: true });

  await gotoLegal(page, "/privacy-policy");
  const sharing = await runLocator(page, "sharing");
  const textMessaging = await runLocator(page, "text-messaging");
  await assertRunVisible(page, sharing, "Privacy #sharing");
  await assertRunVisible(page, textMessaging, "Privacy Text Messaging");
  await highlight(sharing);
  await highlight(textMessaging);
  await scrollRun(sharing);
  await page.screenshot({
    path: `${SHOT_DIR}/sms-twilio-privacy-${width}.png`,
    fullPage: true,
  });
  await shotRun(page, sharing, "sharing", width);
  await scrollRun(textMessaging);
  await shotRun(page, textMessaging, "text-messaging", width);

  await gotoLegal(page, "/sms-terms");
  const mobileNumbers = await runLocator(page, "mobile-numbers");
  await assertRunVisible(page, mobileNumbers, "/sms-terms #mobile-numbers");
  await highlight(mobileNumbers);
  await scrollRun(mobileNumbers);
  await page.screenshot({
    path: `${SHOT_DIR}/sms-twilio-terms-${width}.png`,
    fullPage: true,
  });
  await shotRun(page, mobileNumbers, "mobile-numbers", width);

  expect(RUNS).toHaveLength(3);
});

const HIDE_TRICKS = [
  { id: "sr-only", apply: "class" as const, value: "sr-only" },
  { id: "transparent-text", apply: "style" as const, value: "color: transparent" },
  { id: "text-indent", apply: "style" as const, value: "text-indent: -9999px" },
  { id: "clip-path-inset", apply: "style" as const, value: "clip-path: inset(100%)" },
  { id: "height-0-overflow-parent", apply: "parent" as const, value: "height: 0; overflow: hidden" },
  { id: "filter-opacity-parent", apply: "parent" as const, value: "filter: opacity(0)" },
  { id: "overlay", apply: "overlay" as const, value: "" },
  { id: "opacity-01", apply: "style" as const, value: "opacity: .01" },
  { id: "display-none-exclusion", apply: "exclusion" as const, value: "" },
] as const;

const PASS_CONTROLS = [
  { id: "color-only", apply: "style" as const, value: "color: rgb(20, 40, 30)" },
  { id: "backface-visibility", apply: "style" as const, value: "backface-visibility: hidden" },
  { id: "fill-opacity-attr", apply: "style" as const, value: "fill-opacity: 0" },
] as const;

test("readable-check kills the nine hide tricks and keeps pass controls", async ({ page }) => {
  await gotoLegal(page, "/privacy-policy");
  const control = await runLocator(page, "sharing");
  await assertRunVisible(page, control, "control");

  for (const trick of HIDE_TRICKS) {
    await page.reload({ waitUntil: "domcontentloaded" });
    const locator = await runLocator(page, "sharing");
    await scrollRun(locator);
    if (trick.apply === "class") {
      await locator.evaluate((el, value) => {
        el.classList.add(value);
      }, trick.value);
    } else if (trick.apply === "style") {
      await locator.evaluate((el, value) => {
        el.setAttribute("style", value);
      }, trick.value);
    } else if (trick.apply === "parent") {
      await locator.evaluate((el, value) => {
        el.parentElement?.setAttribute("style", value);
      }, trick.value);
    } else if (trick.apply === "overlay") {
      await locator.evaluate((el) => {
        const box = el.getBoundingClientRect();
        const cover = document.createElement("div");
        cover.setAttribute("data-sms-overlay", "1");
        cover.style.position = "fixed";
        cover.style.left = `${box.left}px`;
        cover.style.top = `${box.top}px`;
        cover.style.width = `${box.width}px`;
        cover.style.height = `${box.height}px`;
        cover.style.background = "white";
        cover.style.zIndex = "2147483647";
        document.body.appendChild(cover);
      });
    } else {
      await locator.evaluate((el, exclusion) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node) {
          const text = node.textContent ?? "";
          const at = text.indexOf(exclusion);
          if (at >= 0) {
            const before = text.slice(0, at);
            const mid = text.slice(at, at + exclusion.length);
            const after = text.slice(at + exclusion.length);
            const span = document.createElement("span");
            span.style.display = "none";
            span.textContent = mid;
            const parent = node.parentNode;
            if (!parent) break;
            if (before) parent.insertBefore(document.createTextNode(before), node);
            parent.insertBefore(span, node);
            if (after) parent.insertBefore(document.createTextNode(after), node);
            parent.removeChild(node);
            break;
          }
          node = walker.nextNode();
        }
      }, SMS_PRIVACY_SHARING_EXCLUSION);
    }
    const result = await collectReadability(locator);
    if (trick.id === "display-none-exclusion") {
      expect(result.innerText, trick.id).not.toContain(SMS_PRIVACY_SHARING_EXCLUSION);
    } else {
      expect(result.ok, `${trick.id} should fail readability: ${result.reasons.join("; ")}`).toBe(
        false,
      );
    }
  }

  for (const controlCase of PASS_CONTROLS) {
    await page.reload({ waitUntil: "domcontentloaded" });
    const locator = await runLocator(page, "sharing");
    await locator.evaluate((el, value) => {
      el.setAttribute("style", value);
    }, controlCase.value);
    await assertRunVisible(page, locator, controlCase.id);
  }
});
