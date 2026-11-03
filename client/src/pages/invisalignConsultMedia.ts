import {
  INVISALIGN_CONSULT_GRAPHICS as DATA_GRAPHICS,
  INVISALIGN_CONSULT_VIDEOS as DATA_VIDEOS,
} from "./invisalignConsultMedia.data";

export const CLOUDINARY_HOST = "res.cloudinary.com";
export const CLOUDINARY_CLOUD = "dhqpqfw6w";

type CloudinaryMediaSrc = `https://${typeof CLOUDINARY_HOST}/${typeof CLOUDINARY_CLOUD}/${string}`;

export type ProductionMediaSrc = `/${string}` | CloudinaryMediaSrc;

type AllowlistedHttpsSrc = CloudinaryMediaSrc;

export type RejectUnsafeProductionSrc<T extends string> = T extends
  | `${string}\\${string}`
  | `${string}\t${string}`
  | `${string}\n${string}`
  | `${string}\r${string}`
  | `//${string}`
  ? never
  : T extends `https://${string}`
    ? T extends AllowlistedHttpsSrc
      ? T
      : never
    : T extends `/${string}`
      ? T
      : never;

export function productionMediaSrc<T extends string>(
  src: RejectUnsafeProductionSrc<T>,
): ProductionMediaSrc {
  return src as ProductionMediaSrc;
}

export type MediaFileVideo = {
  readonly kind: "file";
  readonly id: string;
  readonly title: string;
  readonly src: ProductionMediaSrc;
  readonly poster: ProductionMediaSrc;
  readonly captions: ProductionMediaSrc;
  readonly durationLabel: string;
};

export type MediaEmbedVideo = {
  readonly kind: "embed";
  readonly id: string;
  readonly title: string;
  readonly src:
    | `https://www.youtube-nocookie.com/${string}`
    | `https://player.vimeo.com/${string}dnt=1${string}`;
  readonly poster: ProductionMediaSrc;
  readonly captionsBuiltIn: true;
  readonly durationLabel: string;
};

export type MediaVideo = MediaFileVideo | MediaEmbedVideo;

export type MediaGraphic = {
  readonly id: string;
  readonly src: ProductionMediaSrc;
  readonly alt: string;
  readonly caption?: string;
  readonly width: number;
  readonly height: number;
  readonly contain?: boolean;
};

export type FixtureMediaVideo = {
  readonly kind: "file";
  readonly fixture: true;
  readonly id: string;
  readonly title: string;
  readonly src: string;
  readonly poster: string;
  readonly captions: string;
  readonly durationLabel: string;
};

export type FixtureMediaGraphic = {
  readonly fixture: true;
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly caption?: string;
  readonly width: number;
  readonly height: number;
  readonly contain?: boolean;
};

export type RenderableVideo = MediaVideo | FixtureMediaVideo;
export type RenderableGraphic = MediaGraphic | FixtureMediaGraphic;

const SITE_ORIGIN = "https://www.chriswongdds.com";
const SITE_HOSTNAME = new URL(SITE_ORIGIN).hostname;
const YOUTUBE_PRIVACY_HOST = "www.youtube-nocookie.com";
const VIMEO_PRIVACY_HOST = "player.vimeo.com";

export const PRODUCTION_MEDIA_HOSTS = [CLOUDINARY_HOST] as const;

const PRODUCTION_MEDIA_HOST_SET: ReadonlySet<string> = new Set(
  PRODUCTION_MEDIA_HOSTS,
);

const UNSAFE_SRC_CHARS = /[\\\u0000-\u001F\u007F]/;

function videoLabel(video: { title?: string; id?: string }, index: number): string {
  return video.title || video.id || String(index);
}

function parseAbsoluteUrl(src: string): URL | null {
  try {
    return new URL(src);
  } catch {
    return null;
  }
}

function hasForbiddenSrcChars(src: string): boolean {
  return UNSAFE_SRC_CHARS.test(src);
}

function isSameOriginPath(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//");
}

function hasNonDefaultPort(url: URL): boolean {
  return url.port !== "" && url.port !== "443";
}

function assertCloudinaryCloud(url: URL, label: string): void {
  if (url.hostname !== CLOUDINARY_HOST) {
    return;
  }
  if (!url.pathname.startsWith(`/${CLOUDINARY_CLOUD}/`)) {
    throw new Error(`${label} must use the practice Cloudinary cloud`);
  }
}

function hostnameLooksLikeEmbed(hostname: string): boolean {
  const labels = hostname.toLowerCase().split(".");
  return (
    labels.includes("youtube-nocookie") ||
    labels.includes("youtube") ||
    labels.includes("youtu") ||
    labels.includes("vimeo")
  );
}

export function isFixtureVideo(
  video: RenderableVideo,
): video is FixtureMediaVideo {
  return "fixture" in video && video.fixture === true;
}

export function isFixtureGraphic(
  graphic: RenderableGraphic,
): graphic is FixtureMediaGraphic {
  return "fixture" in graphic && graphic.fixture === true;
}

export function parseMediaUrl(src: string, label: string): URL {
  const trimmed = src.trim();
  if (!trimmed) {
    throw new Error(`${label} is missing a src`);
  }
  if (hasForbiddenSrcChars(trimmed)) {
    throw new Error(`${label} contains an unsafe character`);
  }
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    throw new Error(`${label} cannot use a data: or blob: src in production`);
  }
  if (trimmed.startsWith("//")) {
    throw new Error(`${label} cannot use a protocol-relative URL`);
  }

  let url: URL;
  try {
    url = new URL(trimmed, SITE_ORIGIN);
  } catch {
    throw new Error(`${label} must be a same-origin path or https URL`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`${label} must be a same-origin path or https URL`);
  }
  if (url.username || url.password) {
    throw new Error(`${label} cannot include userinfo`);
  }
  if (hasNonDefaultPort(url)) {
    throw new Error(`${label} cannot use a non-default port`);
  }
  return url;
}

export function parseTrustedMediaUrl(src: string, label: string): URL {
  const url = parseMediaUrl(src, label);
  if (isSameOriginPath(src.trim())) {
    if (url.hostname !== SITE_HOSTNAME) {
      throw new Error(`${label} must stay on the site origin`);
    }
    return url;
  }
  if (!PRODUCTION_MEDIA_HOST_SET.has(url.hostname)) {
    throw new Error(`${label} must use an allowlisted host`);
  }
  assertCloudinaryCloud(url, label);
  return url;
}

export function isAllowlistedMediaUrl(src: string): boolean {
  try {
    parseTrustedMediaUrl(src, "media");
    return true;
  } catch {
    return false;
  }
}

export function assertProductionSrc(
  src: string,
  label: string,
  options: { readonly allowEmbedHosts?: boolean } = {},
): URL {
  const url = parseTrustedMediaUrl(src, label);
  if (!options.allowEmbedHosts && hostnameLooksLikeEmbed(url.hostname)) {
    throw new Error(`${label} cannot use an embed host on a file asset`);
  }
  return url;
}

export function assertPrivacyEmbedSrc(src: string, label: string): URL {
  const trimmed = src.trim();
  if (!trimmed) {
    throw new Error(`${label} must use an https privacy embed URL`);
  }
  if (hasForbiddenSrcChars(trimmed) || trimmed.startsWith("//")) {
    throw new Error(`${label} must use an https privacy embed URL`);
  }

  const url = parseAbsoluteUrl(trimmed);
  if (!url || url.protocol !== "https:") {
    throw new Error(`${label} must use an https privacy embed URL`);
  }
  if (url.username || url.password) {
    throw new Error(`${label} cannot include userinfo`);
  }
  if (hasNonDefaultPort(url)) {
    throw new Error(`${label} cannot use a non-default port`);
  }
  if (url.hostname === YOUTUBE_PRIVACY_HOST) {
    return url;
  }
  if (url.hostname === VIMEO_PRIVACY_HOST) {
    if (url.searchParams.get("dnt") !== "1") {
      throw new Error(`${label} Vimeo embeds must set dnt=1`);
    }
    return url;
  }
  throw new Error(`${label} must use an exact privacy embed host`);
}

export function assertProductionVideo(
  video: MediaVideo,
  index = 0,
): void {
  const label = `Invisalign media video "${videoLabel(video, index)}"`;
  if (isFixtureVideo(video)) {
    throw new Error(`${label} cannot ship as a fixture`);
  }

  switch (video.kind) {
    case "file": {
      if (typeof video.captions !== "string" || !video.captions.trim()) {
        throw new Error(`${label} is missing an English captions track`);
      }
      assertProductionSrc(video.src, `${label} file`);
      assertProductionSrc(video.poster, `${label} poster`);
      assertProductionSrc(video.captions, `${label} captions`);
      return;
    }
    case "embed": {
      if (video.captionsBuiltIn !== true) {
        throw new Error(`${label} embeds must set captionsBuiltIn: true`);
      }
      assertPrivacyEmbedSrc(video.src, label);
      assertProductionSrc(video.poster, `${label} poster`);
      return;
    }
    default: {
      const _exhaustive: never = video;
      throw new Error(`${label} has an unknown kind`);
      return _exhaustive;
    }
  }
}

export const productionMediaValidation = {
  videos: 0,
  graphics: 0,
};

export function assertProductionVideos(videos: readonly MediaVideo[]): void {
  productionMediaValidation.videos += 1;
  videos.forEach((video, index) => assertProductionVideo(video, index));
}

function normalizeComparable(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function resolveGraphicAlt(graphic: RenderableGraphic): string {
  const alt = graphic.alt.trim();
  const caption = graphic.caption?.trim() ?? "";

  if (!alt && !caption) {
    throw new Error(
      `Invisalign media graphic "${graphic.id}" is missing alt text`,
    );
  }
  if (!alt) {
    return "";
  }

  const prefix = "invisalign graphic:";
  const plain = alt.toLowerCase().startsWith(prefix)
    ? alt.slice(alt.toLowerCase().indexOf(prefix) + prefix.length).trim()
    : alt;
  if (!plain) {
    throw new Error(
      `Invisalign media graphic "${graphic.id}" is missing alt text`,
    );
  }
  const prefixed = `Invisalign graphic: ${plain}`;

  if (caption && normalizeComparable(caption) === normalizeComparable(plain)) {
    return "";
  }

  return prefixed;
}

export function assertProductionGraphic(
  graphic: MediaGraphic,
  index = 0,
): void {
  const label = `Invisalign media graphic "${graphic.id || index}"`;
  if (isFixtureGraphic(graphic)) {
    throw new Error(`${label} cannot ship as a fixture`);
  }
  assertProductionSrc(graphic.src, label);
  resolveGraphicAlt(graphic);
}

export function assertProductionGraphics(
  graphics: readonly MediaGraphic[],
): void {
  productionMediaValidation.graphics += 1;
  graphics.forEach((graphic, index) => assertProductionGraphic(graphic, index));
}

export function videoHasAvailableCaptions(video: RenderableVideo): boolean {
  switch (video.kind) {
    case "embed":
      return video.captionsBuiltIn === true;
    case "file":
      if (isFixtureVideo(video)) {
        return Boolean(video.captions.trim());
      }
      return isAllowlistedMediaUrl(video.captions);
    default: {
      const _exhaustive: never = video;
      return _exhaustive;
    }
  }
}

export function embedSrcWithAutoplay(src: string): string {
  const url = new URL(src);
  url.searchParams.set("autoplay", "1");
  if (url.hostname === VIMEO_PRIVACY_HOST) {
    url.searchParams.set("dnt", "1");
  }
  return url.toString();
}

// TODO: add a CSP frame-src allowlist in the same PR as the first embed.
// Do not introduce a partial Content-Security-Policy while the arrays are empty.

export const INVISALIGN_CONSULT_VIDEOS = DATA_VIDEOS;
export const INVISALIGN_CONSULT_GRAPHICS = DATA_GRAPHICS;

assertProductionVideos(INVISALIGN_CONSULT_VIDEOS);
assertProductionGraphics(INVISALIGN_CONSULT_GRAPHICS);
