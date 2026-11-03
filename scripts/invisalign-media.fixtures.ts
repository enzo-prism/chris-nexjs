import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  FixtureMediaGraphic,
  FixtureMediaVideo,
  MediaEmbedVideo,
} from "../client/src/pages/invisalignConsultMedia";

const FIXTURE_VIDEO_PATH = join(
  process.cwd(),
  "scripts/invisalign-media/fixtures/neutral.mp4",
);

export const INVISALIGN_MEDIA_FIXTURE_MARKER = "invisalign-media-fixture";

export function solidSvgDataUri(
  color: string,
  width: number,
  height: number,
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${color}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const FIXTURE_CAPTIONS_SRC = `data:text/vtt,${encodeURIComponent(
  "WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nTest caption.\n",
)}`;

export const FIXTURE_VIDEO_SRC = `data:video/mp4;base64,${readFileSync(FIXTURE_VIDEO_PATH).toString("base64")}`;

export const FIXTURE_EMBED_VIDEO = {
  kind: "embed",
  id: "fixture-embed-1",
  title: `Fixture embed ${INVISALIGN_MEDIA_FIXTURE_MARKER}`,
  // Privacy host only. The embed e2e stubs this request and must not fetch YouTube.
  src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  poster: "/images/redesign/jamal-itero-scan.webp",
  captionsBuiltIn: true,
  durationLabel: "0:15",
} satisfies MediaEmbedVideo;

const POSTER_COLORS = ["#0b2a21", "#1f5a45"] as const;
const GRAPHIC_COLORS = ["#efe8da", "#c8d4cc", "#d7c4a3", "#b7c7be"] as const;

export function getInvisalignMediaFixtures(options: {
  readonly videoCount: 1 | 2;
  readonly graphicCount: 3 | 4;
}): {
  readonly videos: readonly FixtureMediaVideo[];
  readonly graphics: readonly FixtureMediaGraphic[];
} {
  const videos = POSTER_COLORS.slice(0, options.videoCount).map((color, index) => {
    const n = index + 1;
    return {
      kind: "file",
      fixture: true,
      id: `fixture-video-${n}`,
      src: FIXTURE_VIDEO_SRC,
      poster: solidSvgDataUri(color, 1600, 900),
      title: `Fixture video ${n} ${INVISALIGN_MEDIA_FIXTURE_MARKER}`,
      captions: FIXTURE_CAPTIONS_SRC,
      durationLabel: index === 0 ? "0:12" : "0:18",
    } satisfies FixtureMediaVideo;
  });

  const graphics = GRAPHIC_COLORS.slice(0, options.graphicCount).map(
    (color, index) => {
      const n = index + 1;
      return {
        fixture: true,
        id: `fixture-graphic-${n}`,
        src: solidSvgDataUri(color, 1080, 1080),
        alt: `Neutral solid-color graphic ${n} ${INVISALIGN_MEDIA_FIXTURE_MARKER}`,
        caption: `Fixture caption ${n}`,
        width: 1080,
        height: 1080,
        contain: n === 4,
      } satisfies FixtureMediaGraphic;
    },
  );

  return { videos, graphics };
}
