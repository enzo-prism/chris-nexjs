import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { InvisalignMediaImage } from "../client/src/components/invisalign/InvisalignMediaImage";
import { InvisalignMediaSection } from "../client/src/components/invisalign/InvisalignMediaSection";
import { InvisalignMediaVideo } from "../client/src/components/invisalign/InvisalignMediaVideo";
import {
  assertPrivacyEmbedSrc,
  assertProductionGraphic,
  assertProductionGraphics,
  assertProductionSrc,
  assertProductionVideo,
  assertProductionVideos,
  INVISALIGN_CONSULT_GRAPHICS,
  INVISALIGN_CONSULT_VIDEOS,
  productionMediaValidation,
  resolveGraphicAlt,
  type MediaGraphic,
  type MediaVideo,
} from "../client/src/pages/invisalignConsultMedia";
import {
  getInvisalignMediaFixtures,
  INVISALIGN_MEDIA_FIXTURE_MARKER,
} from "./invisalign-media.fixtures";

const videosCheckedAtImport = productionMediaValidation.videos;
const graphicsCheckedAtImport = productionMediaValidation.graphics;

const pair = getInvisalignMediaFixtures({ videoCount: 2, graphicCount: 4 });
const single = getInvisalignMediaFixtures({ videoCount: 1, graphicCount: 3 });

const PRODUCTION_GRAPHIC: MediaGraphic = {
  id: "prod-graphic",
  src: "/images/redesign/jamal-itero-scan.webp",
  alt: "A digital scan",
  caption: "Chairside scan",
  width: 1600,
  height: 1600,
};

function renderSection(
  videos: readonly Parameters<typeof InvisalignMediaSection>[0]["videos"],
  graphics: readonly Parameters<typeof InvisalignMediaSection>[0]["graphics"],
): string {
  return renderToStaticMarkup(
    createElement(InvisalignMediaSection, { videos, graphics }),
  );
}

function walkFiles(directoryPath: string): string[] {
  if (!existsSync(directoryPath)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
    const absolutePath = join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(absolutePath));
      continue;
    }
    files.push(absolutePath);
  }
  return files;
}

function asVideo(video: Record<string, unknown>): MediaVideo {
  return video as unknown as MediaVideo;
}

function asGraphic(graphic: Record<string, unknown>): MediaGraphic {
  return graphic as unknown as MediaGraphic;
}

function fileVideo(
  overrides: Record<string, unknown> = {},
): MediaVideo {
  return asVideo({
    kind: "file",
    id: "test-video",
    title: "Test video",
    src: "/media/invisalign/demo.mp4",
    poster: "/media/invisalign/demo.jpg",
    captions: "/media/invisalign/demo.vtt",
    durationLabel: "0:10",
    ...overrides,
  });
}

function embedVideo(
  overrides: Record<string, unknown> = {},
): MediaVideo {
  return asVideo({
    kind: "embed",
    id: "test-embed",
    title: "Test embed",
    src: "https://www.youtube-nocookie.com/embed/abc123",
    poster: "/media/invisalign/yt.jpg",
    captionsBuiltIn: true,
    durationLabel: "0:18",
    ...overrides,
  });
}

describe("invisalign consult media data", () => {
  it("validates shipped arrays at module load", () => {
    assert.ok(
      videosCheckedAtImport >= 1,
      "assertProductionVideos must run when the data module loads",
    );
    assert.ok(
      graphicsCheckedAtImport >= 1,
      "assertProductionGraphics must run when the data module loads",
    );
  });

  it("ships empty video and graphic arrays", () => {
    assert.equal(INVISALIGN_CONSULT_VIDEOS.length, 0);
    assert.equal(INVISALIGN_CONSULT_GRAPHICS.length, 0);
  });

  it("accepts an empty video list", () => {
    assert.doesNotThrow(() => assertProductionVideos([]));
  });

  it("accepts a same-origin file video with English captions", () => {
    assert.doesNotThrow(() => assertProductionVideo(fileVideo()));
  });

  it("accepts privacy embeds with captionsBuiltIn", () => {
    assert.doesNotThrow(() => assertProductionVideo(embedVideo()));
    assert.doesNotThrow(() =>
      assertProductionVideo(
        embedVideo({
          src: "https://player.vimeo.com/video/123?dnt=1",
        }),
      ),
    );
  });

  it("fails when a file video is missing captions", () => {
    assert.throws(
      () => assertProductionVideo(fileVideo({ captions: "   " })),
      /missing an English captions track/,
    );
  });

  it("fails a youtube-nocookie embed without captionsBuiltIn even if a captions string is set", () => {
    assert.throws(
      () =>
        assertProductionVideo(
          embedVideo({
            captionsBuiltIn: undefined,
            captions: "/media/invisalign/demo.vtt",
          }),
        ),
      /captionsBuiltIn/,
    );
  });

  it("fails a Vimeo embed that is missing dnt=1", () => {
    assert.throws(
      () =>
        assertPrivacyEmbedSrc(
          "https://player.vimeo.com/video/123",
          "vimeo",
        ),
      /dnt=1/,
    );
    assert.throws(
      () =>
        assertProductionVideo(
          embedVideo({ src: "https://player.vimeo.com/video/123" }),
        ),
      /dnt=1/,
    );
  });

  it("fails http, empty, blob, and lookalike-host file sources", () => {
    assert.throws(
      () => assertProductionSrc("http://example.com/demo.mp4", "http file"),
      /same-origin path or https/,
    );
    assert.throws(
      () => assertProductionSrc("", "empty file"),
      /missing a src/,
    );
    assert.throws(
      () => assertProductionSrc("   ", "whitespace file"),
      /missing a src/,
    );
    assert.throws(
      () => assertProductionSrc("blob:https://example.com/abc", "blob file"),
      /data: or blob:/,
    );
    assert.throws(
      () =>
        assertProductionSrc(
          "https://youtube-nocookie.com.evil.com/video.mp4",
          "lookalike file",
        ),
      /cannot use an embed host/,
    );
    assert.throws(
      () =>
        assertProductionVideo(
          fileVideo({
            src: "https://youtube-nocookie.com.evil.com/video.mp4",
          }),
        ),
      /cannot use an embed host/,
    );
  });

  it("fails http and non-allowlisted embed hosts", () => {
    assert.throws(
      () =>
        assertPrivacyEmbedSrc(
          "http://www.youtube-nocookie.com/embed/abc123",
          "http embed",
        ),
      /https privacy embed/,
    );
    assert.throws(
      () =>
        assertProductionVideo(
          embedVideo({ src: "https://www.youtube.com/embed/abc123" }),
        ),
      /exact privacy embed host/,
    );
  });

  it("rejects data, blob, and non-https graphics in production data", () => {
    assert.throws(
      () =>
        assertProductionGraphic(
          asGraphic({
            id: "data-graphic",
            src: "data:image/png,AAAA",
            alt: "A still",
            width: 1080,
            height: 1080,
          }),
        ),
      /data: or blob:/,
    );
    assert.throws(
      () =>
        assertProductionGraphic(
          asGraphic({
            id: "blob-graphic",
            src: "blob:https://example.com/abc",
            alt: "A still",
            width: 1080,
            height: 1080,
          }),
        ),
      /data: or blob:/,
    );
    assert.throws(
      () =>
        assertProductionGraphic(
          asGraphic({
            id: "http-graphic",
            src: "http://example.com/still.jpg",
            alt: "A still",
            width: 1080,
            height: 1080,
          }),
        ),
      /same-origin path or https/,
    );
    assert.doesNotThrow(() => assertProductionGraphics([PRODUCTION_GRAPHIC]));
  });
});

describe("resolveGraphicAlt", () => {
  const base = {
    id: "g1",
    src: "/g1.png",
    width: 1080,
    height: 1080,
  } as const;

  it("rejects empty or whitespace alt when no caption exists", () => {
    assert.throws(
      () => resolveGraphicAlt({ ...base, alt: "" }),
      /missing alt text/,
    );
    assert.throws(
      () => resolveGraphicAlt({ ...base, alt: "   " }),
      /missing alt text/,
    );
    assert.throws(
      () => resolveGraphicAlt({ ...base, alt: "\n\t", caption: "  " }),
      /missing alt text/,
    );
    assert.throws(
      () =>
        assertProductionGraphic(
          asGraphic({ ...base, alt: "   ", caption: "" }),
        ),
      /missing alt text/,
    );
  });

  it("allows a blank alt when a caption exists", () => {
    assert.equal(
      resolveGraphicAlt({ ...base, alt: "  ", caption: "Aligners on a tray" }),
      "",
    );
  });

  it("prefixes unique alt text once, case-insensitively", () => {
    assert.equal(
      resolveGraphicAlt({
        ...base,
        alt: "Aligners on a tray",
        caption: "A different caption",
      }),
      "Invisalign graphic: Aligners on a tray",
    );
    assert.equal(
      resolveGraphicAlt({
        ...base,
        alt: "invisalign graphic: Tray",
        caption: "A different caption",
      }),
      "Invisalign graphic: Tray",
    );
    assert.equal(
      resolveGraphicAlt({
        ...base,
        alt: "INVISALIGN GRAPHIC: Tray",
        caption: "A different caption",
      }),
      "Invisalign graphic: Tray",
    );
  });

  it("treats caption repeats as decorative after normalizing case and whitespace", () => {
    assert.equal(
      resolveGraphicAlt({
        ...base,
        alt: "Aligners on a tray",
        caption: "Aligners on a tray",
      }),
      "",
    );
    assert.equal(
      resolveGraphicAlt({
        ...base,
        alt: "  ALIGNERS   on a   TRAY ",
        caption: "aligners on a tray",
      }),
      "",
    );
  });
});

describe("InvisalignMediaSection", () => {
  it("renders null when both arrays are empty", () => {
    assert.equal(renderSection([], []), "");
  });

  it("hides the video slot when only graphics are present", () => {
    const html = renderSection([], single.graphics);
    assert.equal(html.includes("data-invisalign-media-videos="), false);
    assert.match(html, /data-invisalign-media-graphics="3"/);
    assert.match(html, /id="invisalign-media"/);
    assert.match(html, /aria-labelledby="invisalign-media-title"/);
  });

  it("hides the graphic slot when only videos are present", () => {
    const html = renderSection(single.videos, []);
    assert.match(html, /data-invisalign-media-videos="1"/);
    assert.equal(html.includes("data-invisalign-media-graphics="), false);
  });

  it("uses max-w-3xl for one video and a two-column grid for two", () => {
    const one = renderSection(single.videos, []);
    const two = renderSection(pair.videos, []);
    const oneVideos = one.slice(one.indexOf('data-invisalign-media-videos="1"'));
    const twoVideos = two.slice(two.indexOf('data-invisalign-media-videos="2"'));
    assert.match(oneVideos, /max-w-3xl/);
    assert.equal(oneVideos.includes("lg:grid-cols-2"), false);
    assert.match(twoVideos, /lg:grid-cols-2/);
    assert.equal(
      twoVideos.startsWith('data-invisalign-media-videos="2"') &&
        twoVideos.includes("max-w-3xl"),
      false,
    );
  });

  it("uses a 3-up desktop grid for three graphics and 4-up for four", () => {
    const three = renderSection([], single.graphics);
    const four = renderSection([], pair.graphics);
    assert.match(three, /data-invisalign-media-graphics="3"/);
    assert.match(three, /lg:grid-cols-3/);
    assert.equal(three.includes("lg:grid-cols-4"), false);
    assert.match(four, /data-invisalign-media-graphics="4"/);
    assert.match(four, /lg:grid-cols-4/);
    assert.equal(four.includes("lg:grid-cols-3"), false);
  });

  it("keeps fixture graphics lazy, sized, and never priority", () => {
    const html = renderSection([], pair.graphics);
    const graphicImgs = html.match(/<img\b[^>]*>/g) ?? [];
    assert.equal(graphicImgs.length, 4);
    for (const img of graphicImgs) {
      assert.match(img, /loading="lazy"/);
      assert.match(img, /sizes="\(min-width:1024px\) 292px, 50vw"/);
      assert.doesNotMatch(img, /fetchpriority="high"/i);
      assert.doesNotMatch(img, /loading="eager"/);
    }
    assert.match(html, /object-contain/);
  });

  it("omits the caption strip when a graphic has no caption", () => {
    const html = renderSection(
      [],
      [{ ...pair.graphics[0]!, caption: undefined }],
    );
    assert.equal(html.includes("<figcaption"), false);
  });

  it("omits the caption strip when a graphic caption is only whitespace", () => {
    const html = renderSection([], [{ ...pair.graphics[0]!, caption: "   " }]);
    assert.equal(html.includes("<figcaption"), false);
  });

  it("uses the spec credit line and no free-consult, pricing, or financing copy", () => {
    const html = renderSection(pair.videos, pair.graphics);
    assert.match(html, /Videos and graphics © Align Technology, Inc\./);
    assert.doesNotMatch(html, /Used with permission/);
    assert.doesNotMatch(html, /free consult/i);
    assert.doesNotMatch(html, /financing/i);
    assert.doesNotMatch(html, /\$\d/);
  });
});

describe("InvisalignMediaImage production path", () => {
  it("rejects data, blob, and http sources at render time", () => {
    assert.throws(
      () =>
        renderToStaticMarkup(
          createElement(InvisalignMediaImage, {
            src: "data:image/png,AAAA" as never,
            alt: "x",
            sizes: "100vw",
          }),
        ),
      /data: or blob:/,
    );
    assert.throws(
      () =>
        renderToStaticMarkup(
          createElement(InvisalignMediaImage, {
            src: "blob:https://example.com/1" as never,
            alt: "x",
            sizes: "100vw",
          }),
        ),
      /data: or blob:/,
    );
    assert.throws(
      () =>
        renderToStaticMarkup(
          createElement(InvisalignMediaImage, {
            src: "http://example.com/a.jpg" as never,
            alt: "x",
            sizes: "100vw",
          }),
        ),
      /same-origin path or https/,
    );
  });

  it("accepts a same-origin production src before render", () => {
    assert.doesNotThrow(() =>
      assertProductionSrc(
        "/images/redesign/jamal-itero-scan.webp",
        "production image",
      ),
    );
  });
});

describe("InvisalignMediaVideo facade", () => {
  it("renders the poster and play button without a video or iframe", () => {
    const html = renderToStaticMarkup(
      createElement(InvisalignMediaVideo, { video: single.videos[0]! }),
    );
    assert.equal(html.includes("<video"), false);
    assert.equal(html.includes("<iframe"), false);
    assert.match(
      html,
      /aria-label="Play video: Fixture video 1 invisalign-media-fixture \(0:12, captions available\)"/,
    );
    assert.match(html, /min-h-11/);
    assert.match(html, /min-w-11/);
    assert.match(html, /Captions available · 0:12/);
    assert.match(html, /alt=""/);
    assert.match(html, /loading="lazy"/);
    assert.doesNotMatch(html, /fetchpriority="high"/i);
  });
});

describe("fixture and production exclusion", () => {
  it("loads fixture video bytes from the test directory", () => {
    const fixturePath = join(
      process.cwd(),
      "scripts/invisalign-media/fixtures/neutral.mp4",
    );
    assert.equal(existsSync(fixturePath), true);
    assert.ok(statSync(fixturePath).size > 0);
    assert.match(pair.videos[0]!.src, /^data:video\/mp4;base64,/);
    assert.match(pair.videos[0]!.poster, /^data:image\/svg\+xml/);
    assert.match(pair.graphics[0]!.src, /^data:image\/svg\+xml/);
    assert.equal(pair.videos[0]!.id, "fixture-video-1");
    assert.equal(pair.graphics[0]!.width, 1080);
    assert.equal(pair.videos[0]!.kind, "file");
    assert.equal(pair.videos[0]!.fixture, true);
  });

  it("keeps fixture art out of public/ and production page modules", () => {
    const publicFiles = walkFiles("public");
    assert.equal(
      publicFiles.some((file) => file.includes("invisalign-media")),
      false,
      "fixture files must not land in public/",
    );

    const productionSources = [
      "client/src/pages/InvisalignConsult.tsx",
      "client/src/pages/invisalignConsultMedia.ts",
    ];
    for (const file of productionSources) {
      const source = readFileSync(file, "utf8");
      assert.equal(
        source.includes(INVISALIGN_MEDIA_FIXTURE_MARKER),
        false,
        `${file} must not import fixture art`,
      );
      assert.equal(
        source.includes("invisalign-media.fixtures"),
        false,
        `${file} must not import the fixture module`,
      );
      assert.equal(
        source.includes("InvisalignMediaFixtureImage"),
        false,
        `${file} must not import the fixture image path`,
      );
    }
  });

  it("registers the preview as page.dev.tsx and only enables that extension in development", () => {
    assert.equal(existsSync("app/dev/invisalign-media/page.dev.tsx"), true);
    assert.equal(existsSync("app/dev/invisalign-media/page.tsx"), false);

    const nextConfig = readFileSync("next.config.mjs", "utf8");
    assert.match(nextConfig, /pageExtensions/);
    assert.match(nextConfig, /dev\.tsx/);
    assert.match(
      nextConfig,
      /isProd \? \["tsx", "ts"\] : \["tsx", "ts", "dev\.tsx"\]/,
    );
  });

  it("omits the preview route from a production Next build", () => {
    const appPathsPath = ".next/server/app-paths-manifest.json";
    const routesPath = ".next/app-path-routes-manifest.json";
    const isProductionBuild =
      existsSync(".next/BUILD_ID") && existsSync(".next/required-server-files.json");
    if (!isProductionBuild) {
      return;
    }

    const manifests = [appPathsPath, routesPath]
      .filter((file) => existsSync(file))
      .map((file) => readFileSync(file, "utf8"));

    for (const manifest of manifests) {
      assert.equal(
        /dev\/invisalign-media/.test(manifest),
        false,
        "production app-paths must not include /dev/invisalign-media",
      );
    }

    assert.equal(
      existsSync(".next/server/app/dev/invisalign-media"),
      false,
      "production output must not compile /dev/invisalign-media",
    );

    if (existsSync(".next") && statSync(".next").isDirectory()) {
      const consultArtifacts = walkFiles(".next/server/app").filter((file) =>
        file.includes("invisalign-consult"),
      );
      for (const file of consultArtifacts) {
        if (!statSync(file).isFile()) continue;
        const contents = readFileSync(file, "utf8");
        assert.equal(
          contents.includes(INVISALIGN_MEDIA_FIXTURE_MARKER),
          false,
          `${file} must not contain fixture markers`,
        );
      }
    }
  });
});
