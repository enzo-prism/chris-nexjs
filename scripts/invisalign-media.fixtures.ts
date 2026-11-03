import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { MediaGraphic, MediaVideo } from "../client/src/pages/invisalignConsultMedia";

// cwd-relative so Next's webpack bundle does not wrap import.meta.url
// in a URL object that Node's fileURLToPath then rejects.
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

const POSTER_COLORS = ["#0b2a21", "#1f5a45"] as const;
const GRAPHIC_COLORS = ["#efe8da", "#c8d4cc", "#d7c4a3", "#b7c7be"] as const;

export function getInvisalignMediaFixtures(options: {
  readonly videoCount: 1 | 2;
  readonly graphicCount: 3 | 4;
}): {
  readonly videos: readonly MediaVideo[];
  readonly graphics: readonly MediaGraphic[];
} {
  const videos = POSTER_COLORS.slice(0, options.videoCount).map((color, index) => {
    const n = index + 1;
    return {
      src: FIXTURE_VIDEO_SRC,
      poster: solidSvgDataUri(color, 1600, 900),
      title: `Fixture video ${n} ${INVISALIGN_MEDIA_FIXTURE_MARKER}`,
      captionsSrc: FIXTURE_CAPTIONS_SRC,
      runtime: index === 0 ? "0:12" : "0:18",
    } satisfies MediaVideo;
  });

  const graphics = GRAPHIC_COLORS.slice(0, options.graphicCount).map(
    (color, index) => {
      const n = index + 1;
      return {
        src: solidSvgDataUri(color, 1080, 1080),
        alt: `Neutral solid-color graphic ${n} ${INVISALIGN_MEDIA_FIXTURE_MARKER}`,
        caption: `Fixture caption ${n}`,
      } satisfies MediaGraphic;
    },
  );

  return { videos, graphics };
}
