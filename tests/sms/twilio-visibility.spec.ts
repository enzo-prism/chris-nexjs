import { existsSync, mkdirSync, writeFileSync } from "node:fs";

import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  contrastRatio,
  CONSENT_OCR_PHRASES,
  ocrPng,
  phrasesRecognized,
  pngPixelStats,
  TWILIO_OCR_PHRASES,
} from "../../scripts/sms-pixel-truth";
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
const MIN_FONT_PX = 10;
/** Changed pixels must cover this fraction of the text bounding area (device pixels). */
const MIN_TEXT_PIXEL_RATIO = 0.08;
const MIN_CONTRAST = 3;

type Readability = {
  ok: boolean;
  reasons: string[];
  width: number;
  height: number;
  innerText: string;
  fontSize: number;
  textRgb: [number, number, number];
  textAlpha: number;
  textArea: number;
  devicePixelRatio: number;
};

type PixelProof = {
  changed: number;
  ratio: number;
  contrast: number;
  ocrText: string;
  missed: readonly string[];
  distances: Readonly<Record<string, number>>;
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

    const canvasColor = (value: string): { r: number; g: number; b: number; a: number } => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return { r: 0, g: 0, b: 0, a: 1 };
      ctx.fillStyle = "#000";
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      return { r: data[0] ?? 0, g: data[1] ?? 0, b: data[2] ?? 0, a: (data[3] ?? 0) / 255 };
    };

    const nodeConceals = (target: HTMLElement, computed: CSSStyleDeclaration, self: boolean): boolean => {
      if (computed.display === "none") return true;
      if (computed.visibility === "hidden" || computed.visibility === "collapse") return true;
      if (parseFloat(computed.opacity) < 0.5) return true;
      const filter = computed.filter || "";
      if (filter !== "none") {
        if (/blur\(/.test(filter)) return true;
        const opacityMatch = filter.match(/opacity\(\s*([\d.]+)\s*\)/);
        if (opacityMatch && parseFloat(opacityMatch[1] ?? "1") < 0.5) return true;
      }
      const mask = computed.maskImage || (computed as CSSStyleDeclaration & { webkitMaskImage?: string }).webkitMaskImage;
      if (mask && mask !== "none") return true;
      if (computed.mixBlendMode && computed.mixBlendMode !== "normal") return true;
      if (self) return false;
      const ancestorBox = target.getBoundingClientRect();
      const overflowHidden =
        computed.overflow === "hidden" ||
        computed.overflowX === "hidden" ||
        computed.overflowY === "hidden";
      if (overflowHidden && (ancestorBox.width < 1 || ancestorBox.height < 1)) return true;
      if (target.getAttribute("aria-hidden") === "true") return true;
      return false;
    };

    if (!(box.width >= 1 && box.height >= 1)) reasons.push("box < 1px");
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
    if (!(fontSize >= 10)) reasons.push(`font-size ${fontSize}`);
    if ((style.contentVisibility || "visible") === "hidden") reasons.push("content-visibility hidden");
    const clip = style.clip;
    if (clip && clip !== "auto" && clip !== "none") reasons.push(`clip ${clip}`);
    const clipPath =
      style.clipPath || (style as CSSStyleDeclaration & { webkitClipPath?: string }).webkitClipPath;
    const clipPathNormalized = (clipPath || "").replace(/\s+/g, " ").trim();
    const clipPathInsetZero = /^inset\(\s*(?:0(?:px|%)?\s*){1,4}\)$/.test(clipPathNormalized);
    if (clipPath && clipPath !== "none" && !clipPathInsetZero) reasons.push(`clip-path ${clipPath}`);
    const indent = parseFloat(style.textIndent);
    if (Number.isFinite(indent) && Math.abs(indent) >= Math.max(box.width, 1)) {
      reasons.push(`text-indent ${style.textIndent}`);
    }
    const lineClamp = style.webkitLineClamp || (style as CSSStyleDeclaration & { lineClamp?: string }).lineClamp;
    if (lineClamp && lineClamp !== "none" && Number.parseInt(lineClamp, 10) > 0) {
      reasons.push(`line-clamp ${lineClamp}`);
    }
    if ((style.textOverflow || "").includes("ellipsis")) reasons.push("text-overflow ellipsis");
    const overflowVisible =
      style.overflow === "visible" && style.overflowX === "visible" && style.overflowY === "visible";
    if (
      !overflowVisible &&
      (node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1)
    ) {
      reasons.push("overflow clips content");
    }

    const painted = canvasColor(style.color);
    if (painted.a < 0.5) reasons.push(`color alpha ${painted.a}`);
    const selfFill = canvasColor(style.webkitTextFillColor || style.color);
    if (selfFill.a < 0.5) reasons.push(`text-fill alpha ${selfFill.a}`);

    const channelLin = (channel: number): number => {
      const value = channel / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    const luminanceOf = (rgb: { r: number; g: number; b: number }): number =>
      0.2126 * channelLin(rgb.r) + 0.7152 * channelLin(rgb.g) + 0.0722 * channelLin(rgb.b);
    const contrastOf = (
      fg: { r: number; g: number; b: number },
      bg: { r: number; g: number; b: number },
    ): number => {
      const left = luminanceOf(fg);
      const right = luminanceOf(bg);
      const hi = Math.max(left, right);
      const lo = Math.min(left, right);
      return (hi + 0.05) / (lo + 0.05);
    };
    const effectiveBackground = (
      start: HTMLElement,
    ): { r: number; g: number; b: number; a: number } => {
      let current: HTMLElement | null = start;
      while (current) {
        const bg = canvasColor(window.getComputedStyle(current).backgroundColor);
        if (bg.a >= 0.5) return bg;
        current = current.parentElement;
      }
      return { r: 255, g: 255, b: 255, a: 1 };
    };

    let textArea = 0;
    const range = document.createRange();
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const textNode = walker.currentNode as Text;
      const raw = textNode.nodeValue ?? "";
      if (!raw.trim()) continue;
      const parent = textNode.parentElement;
      if (parent) {
        const computed = window.getComputedStyle(parent);
        const snippet = raw.replace(/\s+/g, " ").trim().slice(0, 48);
        const color = canvasColor(computed.color);
        const fill = canvasColor(computed.webkitTextFillColor || computed.color);
        const alpha = Math.min(color.a, fill.a);
        if (alpha < 0.5) {
          reasons.push(`descendant color alpha ${alpha} on "${snippet}"`);
        }
        const opacity = Number.parseFloat(computed.opacity);
        if (Number.isFinite(opacity) && opacity < 0.5) {
          reasons.push(`descendant opacity ${opacity} on "${snippet}"`);
        }
        if (computed.visibility === "hidden" || computed.visibility === "collapse") {
          reasons.push(`descendant visibility ${computed.visibility} on "${snippet}"`);
        }
        const descendantFont = Number.parseFloat(computed.fontSize);
        if (Number.isFinite(descendantFont) && descendantFont < 10) {
          reasons.push(`descendant font-size ${descendantFont} on "${snippet}"`);
        }
        if (alpha >= 0.5) {
          const bg = effectiveBackground(parent);
          const paintedContrast = Math.min(contrastOf(color, bg), contrastOf(fill, bg));
          if (paintedContrast < 3) {
            reasons.push(`descendant contrast ${paintedContrast.toFixed(2)} on "${snippet}"`);
          }
        }
      }
      range.selectNodeContents(textNode);
      for (const rect of range.getClientRects()) {
        textArea += Math.max(0, rect.width) * Math.max(0, rect.height);
      }
    }

    let cumulativeOpacity = Number.isFinite(parseFloat(style.opacity)) ? parseFloat(style.opacity) : 1;
    let current: HTMLElement | null = node;
    let ancestorHides = false;
    let self = true;
    while (current) {
      const computed = window.getComputedStyle(current);
      if (nodeConceals(current, computed, self)) {
        ancestorHides = true;
        break;
      }
      if (!self) {
        cumulativeOpacity *= Number.isFinite(parseFloat(computed.opacity))
          ? parseFloat(computed.opacity)
          : 1;
      }
      current = current.parentElement;
      self = false;
    }
    if (ancestorHides) reasons.push("node or ancestor conceals");
    if (cumulativeOpacity < 0.5) reasons.push(`cumulative opacity ${cumulativeOpacity}`);

    const rects = node.getClientRects();
    const sampleRect = rects[0] ?? box;
    const points = [
      [sampleRect.left + sampleRect.width / 2, sampleRect.top + sampleRect.height / 2],
      [sampleRect.left + sampleRect.width * 0.25, sampleRect.top + sampleRect.height / 2],
      [sampleRect.left + sampleRect.width * 0.75, sampleRect.top + sampleRect.height / 2],
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
      fontSize,
      textRgb: [painted.r, painted.g, painted.b],
      textAlpha: painted.a,
      textArea,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
  });
}

function textPixelThreshold(textArea: number, devicePixelRatio: number): number {
  return textArea * devicePixelRatio * devicePixelRatio * MIN_TEXT_PIXEL_RATIO;
}

function passagePainted(proof: PixelProof, textArea: number, devicePixelRatio: number): boolean {
  const needed = textPixelThreshold(textArea, devicePixelRatio);
  return needed > 0 && proof.changed >= needed;
}

async function clipScreenshot(locator: Locator): Promise<Buffer> {
  return locator.screenshot({ animations: "disabled" });
}

async function withTransparentText<T>(locator: Locator, run: () => Promise<T>): Promise<T> {
  await locator.evaluate((el) => {
    const apply = (node: HTMLElement): void => {
      node.dataset.smsPrevColor = node.style.color;
      node.dataset.smsPrevFill = node.style.webkitTextFillColor;
      node.dataset.smsPrevShadow = node.style.textShadow;
      node.style.color = "transparent";
      node.style.webkitTextFillColor = "transparent";
      node.style.textShadow = "0 0 0 transparent";
    };
    apply(el as HTMLElement);
    for (const child of Array.from((el as HTMLElement).querySelectorAll("*"))) {
      apply(child as HTMLElement);
    }
  });
  try {
    return await run();
  } finally {
    await locator.evaluate((el) => {
      const restore = (node: HTMLElement): void => {
        node.style.color = node.dataset.smsPrevColor ?? "";
        node.style.webkitTextFillColor = node.dataset.smsPrevFill ?? "";
        node.style.textShadow = node.dataset.smsPrevShadow ?? "";
        delete node.dataset.smsPrevColor;
        delete node.dataset.smsPrevFill;
        delete node.dataset.smsPrevShadow;
      };
      restore(el as HTMLElement);
      for (const child of Array.from((el as HTMLElement).querySelectorAll("*"))) {
        restore(child as HTMLElement);
      }
    });
  }
}

async function collectPixelProof(
  locator: Locator,
  phrases: readonly string[],
  textRgb: [number, number, number],
): Promise<PixelProof> {
  const before = await clipScreenshot(locator);
  const after = await withTransparentText(locator, () => clipScreenshot(locator));
  const stats = pngPixelStats(before, after);
  const contrast = contrastRatio(textRgb, stats.afterAverage);
  const ocrText = ocrPng(before);
  const recognized = phrasesRecognized(ocrText, phrases);
  return {
    changed: stats.changed,
    ratio: stats.ratio,
    contrast,
    ocrText,
    missed: recognized.missed,
    distances: recognized.distances,
  };
}

function writeProofFiles(
  name: string,
  width: number,
  proof: PixelProof,
  painted: Buffer,
  textArea: number,
  devicePixelRatio: number,
): void {
  mkdirSync(SHOT_DIR, { recursive: true });
  writeFileSync(`${SHOT_DIR}/sms-pixel-${name}-${width}.png`, painted);
  writeFileSync(
    `${SHOT_DIR}/sms-ocr-${name}-${width}.txt`,
    `${proof.ocrText}\nchanged=${proof.changed} ratio=${proof.ratio.toFixed(4)} contrast=${proof.contrast.toFixed(2)} textArea=${textArea.toFixed(1)} dpr=${devicePixelRatio} need=${textPixelThreshold(textArea, devicePixelRatio).toFixed(1)}\n${JSON.stringify(proof.distances, null, 2)}\n`,
  );
}

async function assertPassagePainted(
  page: Page,
  locator: Locator,
  label: string,
  phrases: readonly string[],
  saveAs?: string,
): Promise<PixelProof> {
  await expect(locator, `${label} must be visible`).toBeVisible();
  await scrollRun(locator);
  const metrics = await collectReadability(locator);
  expect(metrics.width, `${label} bounding box width`).toBeGreaterThanOrEqual(MIN_BOX_PX);
  expect(metrics.height, `${label} bounding box height`).toBeGreaterThanOrEqual(MIN_BOX_PX);
  expect(metrics.fontSize, `${label} font-size`).toBeGreaterThanOrEqual(MIN_FONT_PX);
  expect(metrics.ok, `${label} readable: ${metrics.reasons.join("; ")}`).toBe(true);
  const proof = await collectPixelProof(locator, phrases, metrics.textRgb);
  expect(
    passagePainted(proof, metrics.textArea, metrics.devicePixelRatio),
    `${label} pixel-diff too small (${proof.changed} px vs text area ${metrics.textArea.toFixed(1)} @ dpr ${metrics.devicePixelRatio})`,
  ).toBe(true);
  expect(proof.contrast, `${label} contrast ${proof.contrast}`).toBeGreaterThanOrEqual(MIN_CONTRAST);
  expect(proof.missed, `${label} OCR missed ${proof.missed.join("; ")} :: ${proof.ocrText}`).toEqual(
    [],
  );
  if (saveAs) {
    const painted = await clipScreenshot(locator);
    writeProofFiles(
      saveAs,
      page.viewportSize()?.width ?? 0,
      proof,
      painted,
      metrics.textArea,
      metrics.devicePixelRatio,
    );
  }
  return proof;
}

async function assertTwilioRun(page: Page, locator: Locator, label: string, saveAs?: string): Promise<void> {
  const proof = await assertPassagePainted(page, locator, label, TWILIO_OCR_PHRASES, saveAs);
  const metrics = await collectReadability(locator);
  expect(metrics.innerText, `${label} must keep the subcontractor sentence`).toContain(
    SMS_PRIVACY_SUBCONTRACTOR_SHARING,
  );
  expect(metrics.innerText, `${label} must keep the exclusion sentence`).toContain(
    SMS_PRIVACY_SHARING_EXCLUSION,
  );
  expect(proof.ocrText.length, `${label} OCR produced text`).toBeGreaterThan(20);
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

test("the required SMS consent passages are painted and readable", async ({ page }) => {
  const width = page.viewportSize()?.width ?? 0;
  mkdirSync(SHOT_DIR, { recursive: true });

  await gotoLegal(page, "/privacy-policy");
  const sharing = await runLocator(page, "sharing");
  const textMessaging = page.locator("section#text-messaging");
  await assertTwilioRun(page, sharing, "Privacy #sharing", "sharing");
  await assertPassagePainted(
    page,
    textMessaging,
    "Privacy Text Messaging",
    CONSENT_OCR_PHRASES,
    "text-messaging",
  );
  await highlight(sharing);
  await scrollRun(sharing);
  await shotRun(page, sharing, "sharing", width);
  await scrollRun(textMessaging);
  await shotRun(page, textMessaging, "text-messaging", width);

  await gotoLegal(page, "/sms-terms");
  await assertPassagePainted(
    page,
    page.locator("section#frequency-and-rates"),
    "SMS Terms #frequency-and-rates",
    ["message frequency varies", "message and data rates may apply"],
    "terms-frequency",
  );
  await assertPassagePainted(
    page,
    page.locator("section#opt-out-and-help"),
    "SMS Terms #opt-out-and-help",
    ["reply stop to opt out", "reply help for help"],
    "terms-opt-out",
  );
  await assertPassagePainted(
    page,
    page.locator("section#consent-and-care"),
    "SMS Terms #consent-and-care",
    ["consent to receive text messages is not required to receive care"],
    "terms-consent",
  );
  const mobileNumbers = await runLocator(page, "mobile-numbers");
  await assertTwilioRun(page, mobileNumbers, "/sms-terms #mobile-numbers", "mobile-numbers");
  await highlight(mobileNumbers);
  await scrollRun(mobileNumbers);
  await shotRun(page, mobileNumbers, "mobile-numbers", width);
  expect(RUNS).toHaveLength(3);
});

const EGG_TRICKS = [
  {
    id: "truncate",
    apply: "style" as const,
    value: "overflow:hidden;text-overflow:ellipsis;white-space:nowrap",
  },
  {
    id: "line-clamp-1",
    apply: "style" as const,
    value: "display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;overflow:hidden",
  },
  {
    id: "max-h-overflow",
    apply: "style" as const,
    value: "max-height:1.5rem;overflow:hidden",
  },
  { id: "own-filter-opacity", apply: "style" as const, value: "filter:opacity(0)" },
  { id: "own-blur", apply: "style" as const, value: "filter:blur(24px)" },
  { id: "after-overlay", apply: "after" as const, value: "" },
  { id: "oklch-0", apply: "style" as const, value: "color: oklch(0.2 0.05 140 / 0)" },
  {
    id: "text-fill-transparent",
    apply: "style" as const,
    value: "-webkit-text-fill-color: transparent",
  },
  {
    id: "mask-image",
    apply: "style" as const,
    value:
      "mask-image:linear-gradient(transparent, transparent);-webkit-mask-image:linear-gradient(transparent, transparent)",
  },
  { id: "font-0-5px", apply: "style" as const, value: "font-size:0.5px" },
] as const;

async function applyEggTrick(locator: Locator, trick: (typeof EGG_TRICKS)[number]): Promise<void> {
  if (trick.apply === "style") {
    await locator.evaluate((el, value) => {
      el.setAttribute("style", value);
    }, trick.value);
    return;
  }
  await locator.evaluate((el) => {
    el.setAttribute("data-sms-after-overlay", "1");
    (el as HTMLElement).style.position = "relative";
    const style = document.createElement("style");
    style.textContent =
      '[data-sms-after-overlay="1"]::after{content:"";position:absolute;inset:0;background:#fff;}';
    document.head.appendChild(style);
  });
}

async function passageFails(page: Page, locator: Locator): Promise<boolean> {
  await scrollRun(locator);
  const metrics = await collectReadability(locator);
  if (!metrics.ok || metrics.fontSize < MIN_FONT_PX) return true;
  const proof = await collectPixelProof(locator, TWILIO_OCR_PHRASES, metrics.textRgb);
  if (!passagePainted(proof, metrics.textArea, metrics.devicePixelRatio)) return true;
  if (proof.contrast < MIN_CONTRAST) return true;
  if (proof.missed.length > 0) return true;
  return false;
}

test("pixel-truth kills Eggbot's ten hide tricks", async ({ page }) => {
  await gotoLegal(page, "/privacy-policy");
  const control = await runLocator(page, "sharing");
  await assertTwilioRun(page, control, "control");

  for (const trick of EGG_TRICKS) {
    await page.reload({ waitUntil: "domcontentloaded" });
    const locator = await runLocator(page, "sharing");
    await applyEggTrick(locator, trick);
    expect(await passageFails(page, locator), `${trick.id} must be killed`).toBe(true);
  }
});

const MARKETING_QUALIFIER = "with third parties/affiliates for marketing/promotional purposes";

async function wrapSnippet(
  locator: Locator,
  needle: string,
  style: Record<string, string>,
): Promise<void> {
  await locator.evaluate(
    (el, args) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const text = walker.currentNode as Text;
        const value = text.nodeValue ?? "";
        const idx = value.indexOf(args.target);
        if (idx < 0) continue;
        const span = document.createElement("span");
        Object.assign(span.style, args.style);
        span.textContent = args.target;
        const parent = text.parentNode;
        if (!parent) return;
        if (idx > 0) parent.insertBefore(document.createTextNode(value.slice(0, idx)), text);
        parent.insertBefore(span, text);
        text.nodeValue = value.slice(idx + args.target.length);
        break;
      }
    },
    { target: needle, style },
  );
}

test("a transparent span over not or the exclusion prefix fails readability", async ({
  page,
}) => {
  await gotoLegal(page, "/privacy-policy");

  const sharing = await runLocator(page, "sharing");
  await wrapSnippet(sharing, "not ", { color: "transparent" });
  const notMetrics = await collectReadability(sharing);
  expect(notMetrics.ok, `transparent "not " span should fail: ${notMetrics.reasons.join("; ")}`).toBe(
    false,
  );
  expect(
    notMetrics.reasons.some((reason) => reason.includes("descendant color alpha")),
    `expected descendant color failure, got: ${notMetrics.reasons.join("; ")}`,
  ).toBe(true);

  await page.reload({ waitUntil: "domcontentloaded" });
  const exclusion = await runLocator(page, "sharing");
  await wrapSnippet(exclusion, "will not be shared", { color: "transparent" });
  const exclusionMetrics = await collectReadability(exclusion);
  expect(
    exclusionMetrics.ok,
    `transparent exclusion-prefix span should fail: ${exclusionMetrics.reasons.join("; ")}`,
  ).toBe(false);
  expect(
    exclusionMetrics.reasons.some((reason) => reason.includes("descendant color alpha")),
    `expected descendant color failure, got: ${exclusionMetrics.reasons.join("; ")}`,
  ).toBe(true);
});

const QUALIFIER_HIDES = [
  { id: "opacity-0", style: { opacity: "0" }, reason: "descendant opacity" },
  { id: "visibility-hidden", style: { visibility: "hidden" }, reason: "descendant visibility" },
  { id: "1px", style: { fontSize: "1px" }, reason: "descendant font-size" },
  { id: "white", style: { color: "white" }, reason: "descendant contrast" },
] as const;

test("hiding the marketing qualifier on a descendant fails readability", async ({ page }) => {
  await gotoLegal(page, "/privacy-policy");

  for (const trick of QUALIFIER_HIDES) {
    await page.reload({ waitUntil: "domcontentloaded" });
    const locator = await runLocator(page, "sharing");
    await wrapSnippet(locator, MARKETING_QUALIFIER, trick.style);
    const metrics = await collectReadability(locator);
    expect(
      metrics.ok,
      `${trick.id} qualifier span should fail: ${metrics.reasons.join("; ")}`,
    ).toBe(false);
    expect(
      metrics.reasons.some((reason) => reason.includes(trick.reason)),
      `${trick.id} expected ${trick.reason}, got: ${metrics.reasons.join("; ")}`,
    ).toBe(true);
  }
});

test("the retired SMS scan fixture is not a public URL", async ({ page }) => {
  const response = await page.goto("/cache/sms-scan-fixture.txt", {
    waitUntil: "domcontentloaded",
  });
  expect(response?.status(), "/cache/sms-scan-fixture.txt must 404").toBe(404);
});
