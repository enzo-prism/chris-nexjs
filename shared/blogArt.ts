export const BLOG_ART_VIEWBOX = {
  width: 1200,
  height: 720,
} as const;

export const GENERATED_BLOG_IMAGE_PREFIX = "/images/generated/blog/";

type BlogArtPalette = Readonly<{
  backgroundStart: string;
  backgroundMid: string;
  backgroundEnd: string;
  stroke: string;
  panel: string;
  panelBorder: string;
  blobs: readonly [string, string, string];
}>;

export type BlogArtBlob = Readonly<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number;
  opacity: number;
  color: string;
}>;

type BlogArtPanel = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
}>;

export type BlogArtSpec = Readonly<{
  angle: number;
  palette: BlogArtPalette;
  blobs: readonly BlogArtBlob[];
  wavePaths: readonly string[];
  gridOffset: number;
  panel: BlogArtPanel;
  accent: BlogArtPanel;
}>;

const PALETTES: readonly BlogArtPalette[] = [
  {
    backgroundStart: "#fbfdff",
    backgroundMid: "#eef6ff",
    backgroundEnd: "#d6e9ff",
    stroke: "#a8c9ea",
    panel: "#ffffff",
    panelBorder: "#f4f9ff",
    blobs: ["#d8ebff", "#bddcff", "#93c4f2"],
  },
  {
    backgroundStart: "#f9fcff",
    backgroundMid: "#edf5ff",
    backgroundEnd: "#dcecff",
    stroke: "#9dc4e9",
    panel: "#ffffff",
    panelBorder: "#eef7ff",
    blobs: ["#d9ecff", "#c3e0ff", "#81bbec"],
  },
  {
    backgroundStart: "#fbfdff",
    backgroundMid: "#f2f8ff",
    backgroundEnd: "#d9ecff",
    stroke: "#9fc3e3",
    panel: "#ffffff",
    panelBorder: "#f1f8ff",
    blobs: ["#e2f1ff", "#bddcff", "#8ec0f0"],
  },
  {
    backgroundStart: "#fcfeff",
    backgroundMid: "#eef6ff",
    backgroundEnd: "#d7e7fb",
    stroke: "#9abfe0",
    panel: "#ffffff",
    panelBorder: "#eef7ff",
    blobs: ["#dcecff", "#b9dbff", "#8ab9e8"],
  },
];

function hashSlug(input: string): number {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: number): () => number {
  let current = seed || 1;

  return () => {
    current |= 0;
    current = (current + 0x6d2b79f5) | 0;
    let result = Math.imul(current ^ (current >>> 15), 1 | current);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function toFixedNumber(value: number): number {
  return Number(value.toFixed(2));
}

function hexToRgb(hex: string): readonly [number, number, number] {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((digit) => `${digit}${digit}`)
          .join("")
      : normalized;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return [red, green, blue] as const;
}

export function hexToRgba(hex: string, alpha: number): string {
  const [red, green, blue] = hexToRgb(hex);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildWavePath(
  random: () => number,
  width: number,
  height: number,
  offset: number,
): string {
  const startY = height * (0.16 + random() * 0.16 + offset * 0.16);
  const endY = height * (0.22 + random() * 0.18 + offset * 0.14);
  const controlOneY = startY + height * (-0.1 + random() * 0.22);
  const controlTwoY = endY + height * (-0.14 + random() * 0.24);

  return [
    `M ${-120} ${toFixedNumber(startY)}`,
    `C ${toFixedNumber(width * 0.24)} ${toFixedNumber(controlOneY)},`,
    `${toFixedNumber(width * 0.68)} ${toFixedNumber(controlTwoY)},`,
    `${width + 120} ${toFixedNumber(endY)}`,
  ].join(" ");
}

export function getBlogArtImagePath(slug: string): string {
  return `/blog/${slug}/opengraph-image`;
}

export type BlogImageSource = Readonly<{
  slug: string;
  image?: string | null;
}>;

export function getCustomBlogImagePath(
  source?: BlogImageSource | null,
): string | null {
  const image = source?.image?.trim();
  return image?.startsWith(GENERATED_BLOG_IMAGE_PREFIX) ? image : null;
}

export function resolveBlogImagePath(
  source?: BlogImageSource | null,
): string | null {
  if (!source?.slug) return null;

  const image = getCustomBlogImagePath(source);
  if (image) {
    return image;
  }

  return getBlogArtImagePath(source.slug);
}

export function getBlogArtSpec(slug: string): BlogArtSpec {
  const width = BLOG_ART_VIEWBOX.width;
  const height = BLOG_ART_VIEWBOX.height;
  const random = createSeededRandom(hashSlug(slug));
  const palette =
    PALETTES[Math.floor(random() * PALETTES.length)] ?? PALETTES[0];

  const blobs: BlogArtBlob[] = Array.from({ length: 3 }, (_, index) => ({
    cx: toFixedNumber(width * (0.16 + random() * 0.68)),
    cy: toFixedNumber(height * (0.18 + random() * 0.64)),
    rx: toFixedNumber(160 + random() * 120 + index * 18),
    ry: toFixedNumber(120 + random() * 110 + index * 12),
    rotate: toFixedNumber(-34 + random() * 68),
    opacity: toFixedNumber(0.5 + random() * 0.22),
    color: palette.blobs[index] ?? palette.blobs[palette.blobs.length - 1],
  }));

  const wavePaths = [
    buildWavePath(random, width, height, 0),
    buildWavePath(random, width, height, 1),
    buildWavePath(random, width, height, 2),
  ] as const;

  return {
    angle: toFixedNumber(20 + random() * 32),
    palette,
    blobs,
    wavePaths,
    gridOffset: toFixedNumber(18 + random() * 52),
    panel: {
      x: toFixedNumber(86 + random() * 120),
      y: toFixedNumber(84 + random() * 100),
      width: toFixedNumber(320 + random() * 120),
      height: toFixedNumber(160 + random() * 70),
      rotate: toFixedNumber(-12 + random() * 24),
    },
    accent: {
      x: toFixedNumber(width * (0.62 + random() * 0.12)),
      y: toFixedNumber(height * (0.58 + random() * 0.12)),
      width: toFixedNumber(220 + random() * 120),
      height: toFixedNumber(220 + random() * 120),
      rotate: toFixedNumber(-18 + random() * 36),
    },
  };
}
