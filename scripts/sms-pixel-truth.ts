import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PNG } from "pngjs";

export const CONSENT_OCR_PHRASES = [
  "message frequency varies",
  "message and data rates may apply",
  "reply stop to opt out",
  "reply help for help",
  "consent to receive text messages is not required to receive care",
] as const;

export const TWILIO_OCR_PHRASES = [
  "no mobile information will be shared",
  "information sharing to subcontractors",
  "will not be shared with any third parties",
] as const;

export function normalizeOcr(source: string): string {
  return source
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const prev = new Array<number>(b.length + 1);
  const next = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    next[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      next[j] = Math.min((prev[j] ?? 0) + 1, (next[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = next[j] ?? 0;
  }
  return prev[b.length] ?? b.length;
}

export function normalizedPhraseDistance(haystack: string, phrase: string): number {
  const hay = normalizeOcr(haystack);
  const needle = normalizeOcr(phrase);
  if (needle.length === 0) return 1;
  if (hay.includes(needle)) return 0;
  const words = hay.split(" ");
  const needWords = needle.split(" ");
  let best = 1;
  for (let i = 0; i < words.length; i += 1) {
    const window = words.slice(i, i + needWords.length + 2).join(" ");
    const dist = levenshtein(window, needle) / Math.max(window.length, needle.length);
    if (dist < best) best = dist;
  }
  return best;
}

const NEGATION_TOKENS = new Set(["no", "not"]);

export function phraseNegationTokens(phrase: string): readonly string[] {
  return normalizeOcr(phrase).split(" ").filter((token) => NEGATION_TOKENS.has(token));
}

export function isCriticalOcrPhrase(phrase: string): boolean {
  return phraseNegationTokens(phrase).length > 0;
}

export function phrasesRecognized(
  ocrText: string,
  phrases: readonly string[],
  maxDistance = 0.1,
): { readonly missed: readonly string[]; readonly distances: Readonly<Record<string, number>> } {
  const hay = normalizeOcr(ocrText);
  const hayTokens = new Set(hay.split(" ").filter(Boolean));
  const distances: Record<string, number> = {};
  const missed: string[] = [];
  for (const phrase of phrases) {
    const needle = normalizeOcr(phrase);
    const distance = normalizedPhraseDistance(ocrText, phrase);
    distances[phrase] = distance;
    const negations = phraseNegationTokens(phrase);
    if (negations.length > 0) {
      const exactPhrase = hay.includes(needle);
      const exactNegation = negations.every((token) => hayTokens.has(token));
      if (!exactPhrase || !exactNegation) missed.push(phrase);
    } else if (distance > maxDistance) {
      missed.push(phrase);
    }
  }
  return { missed, distances };
}

export function pngPixelStats(before: Buffer, after: Buffer): {
  readonly width: number;
  readonly height: number;
  readonly changed: number;
  readonly ratio: number;
  readonly afterAverage: readonly [number, number, number];
} {
  const first = PNG.sync.read(before);
  const second = PNG.sync.read(after);
  if (first.width !== second.width || first.height !== second.height) {
    throw new Error("pixel-truth screenshots must be the same size");
  }
  let changed = 0;
  let r = 0;
  let g = 0;
  let b = 0;
  const pixels = first.width * first.height;
  for (let i = 0; i < first.data.length; i += 4) {
    const dr = Math.abs((first.data[i] ?? 0) - (second.data[i] ?? 0));
    const dg = Math.abs((first.data[i + 1] ?? 0) - (second.data[i + 1] ?? 0));
    const db = Math.abs((first.data[i + 2] ?? 0) - (second.data[i + 2] ?? 0));
    if (dr + dg + db > 30) changed += 1;
    r += second.data[i] ?? 0;
    g += second.data[i + 1] ?? 0;
    b += second.data[i + 2] ?? 0;
  }
  return {
    width: first.width,
    height: first.height,
    changed,
    ratio: pixels === 0 ? 0 : changed / pixels,
    afterAverage: [r / pixels, g / pixels, b / pixels],
  };
}

export function relativeLuminance(rgb: readonly [number, number, number]): number {
  const linear = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
}

export function contrastRatio(
  foreground: readonly [number, number, number],
  background: readonly [number, number, number],
): number {
  const left = relativeLuminance(foreground);
  const right = relativeLuminance(background);
  const hi = Math.max(left, right);
  const lo = Math.min(left, right);
  return (hi + 0.05) / (lo + 0.05);
}

export function ocrPng(png: Buffer): string {
  const dir = mkdtempSync(join(tmpdir(), "sms-ocr-"));
  const imagePath = join(dir, "passage.png");
  writeFileSync(imagePath, png);
  return execFileSync("tesseract", [imagePath, "stdout", "-l", "eng", "--psm", "6"], {
    encoding: "utf8",
  });
}
