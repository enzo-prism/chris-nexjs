const PRIVACY_EMBED_HOSTS = new Set([
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "player.vimeo.com",
]);

const EMBED_HOSTS = new Set([
  ...PRIVACY_EMBED_HOSTS,
  "www.youtube.com",
  "youtube.com",
  "youtu.be",
  "www.vimeo.com",
  "vimeo.com",
]);

export type MediaVideo = {
  readonly id: string;
  readonly title: string;
  readonly src: string;
  readonly poster: string;
  readonly captions?: string;
  readonly durationLabel: string;
  /** Embeds with built-in captions skip the <track>. File videos must set `captions`. */
  readonly captionsBuiltIn?: boolean;
};

export type MediaGraphic = {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly caption?: string;
  readonly width: number;
  readonly height: number;
  /** Text-heavy stills use object-contain on cream instead of a crop. */
  readonly contain?: boolean;
};

function parseSrcUrl(src: string): URL | null {
  try {
    return new URL(src);
  } catch {
    return null;
  }
}

export function isEmbedSrc(src: string): boolean {
  const url = parseSrcUrl(src);
  return url ? EMBED_HOSTS.has(url.hostname) : false;
}

export function isPrivacyEmbedSrc(src: string): boolean {
  const url = parseSrcUrl(src);
  return url ? PRIVACY_EMBED_HOSTS.has(url.hostname) : false;
}

export function videoHasCaptionAccess(video: MediaVideo): boolean {
  if (video.captions?.trim()) {
    return true;
  }
  return Boolean(video.captionsBuiltIn && isEmbedSrc(video.src));
}

export function assertMediaVideosHaveCaptions(
  videos: readonly MediaVideo[],
): void {
  for (const [index, video] of videos.entries()) {
    const label = video.title || video.id || String(index);
    if (isEmbedSrc(video.src) && !isPrivacyEmbedSrc(video.src)) {
      throw new Error(
        `Invisalign media video "${label}" must use a no-cookie or privacy embed URL`,
      );
    }
    if (!videoHasCaptionAccess(video)) {
      throw new Error(
        `Invisalign media video "${label}" is missing an English captions track`,
      );
    }
  }
}

export function resolveGraphicAlt(graphic: MediaGraphic): string {
  if (!graphic.alt.trim()) {
    return "";
  }

  const prefixed = graphic.alt.startsWith("Invisalign graphic:")
    ? graphic.alt
    : `Invisalign graphic: ${graphic.alt}`;
  const plain = prefixed.replace(/^Invisalign graphic:\s*/, "");

  if (graphic.caption && (graphic.caption === graphic.alt || graphic.caption === plain)) {
    return "";
  }

  return prefixed;
}

// When an embed ships, add a CSP frame-src allowlist for the privacy hosts
// above. The site has no Content-Security-Policy today; do not introduce a
// partial policy just for empty arrays.

/** Align-supplied videos. Ship empty until captioned assets are approved. */
export const INVISALIGN_CONSULT_VIDEOS: readonly MediaVideo[] = [];

/** Align-supplied graphics. Ship empty until approved stills land. */
export const INVISALIGN_CONSULT_GRAPHICS: readonly MediaGraphic[] = [];

assertMediaVideosHaveCaptions(INVISALIGN_CONSULT_VIDEOS);
