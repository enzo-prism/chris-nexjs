import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { InvisalignMediaSection } from "../client/src/components/invisalign/InvisalignMediaSection";
import { InvisalignMediaVideo } from "../client/src/components/invisalign/InvisalignMediaVideo";
import {
  assertMediaVideosHaveCaptions,
  INVISALIGN_CONSULT_GRAPHICS,
  INVISALIGN_CONSULT_VIDEOS,
  resolveGraphicAlt,
  type MediaGraphic,
  type MediaVideo,
} from "../client/src/pages/invisalignConsultMedia";
import {
  getInvisalignMediaFixtures,
  INVISALIGN_MEDIA_FIXTURE_MARKER,
} from "./invisalign-media.fixtures";

const pair = getInvisalignMediaFixtures({ videoCount: 2, graphicCount: 4 });
const single = getInvisalignMediaFixtures({ videoCount: 1, graphicCount: 3 });

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

function fileVideo(overrides: Partial<MediaVideo> = {}): MediaVideo {
  return {
    id: "test-video",
    src: "data:video/mp4,base",
    poster: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
    title: "Test video",
    captions: "data:text/vtt,WEBVTT",
    durationLabel: "0:10",
    ...overrides,
  };
}

describe("invisalign consult media data", () => {
  it("ships empty video and graphic arrays", () => {
    assert.equal(INVISALIGN_CONSULT_VIDEOS.length, 0);
    assert.equal(INVISALIGN_CONSULT_GRAPHICS.length, 0);
  });

  it("accepts an empty video list", () => {
    assert.doesNotThrow(() => assertMediaVideosHaveCaptions([]));
  });

  it("fails when a file video is missing captions", () => {
    assert.throws(
      () => assertMediaVideosHaveCaptions([fileVideo({ captions: "   " })]),
      /missing an English captions track/,
    );
  });

  it("accepts an embed with built-in captions and no track", () => {
    assert.doesNotThrow(() =>
      assertMediaVideosHaveCaptions([
        fileVideo({
          src: "https://www.youtube-nocookie.com/embed/abc123",
          captions: undefined,
          captionsBuiltIn: true,
        }),
      ]),
    );
  });

  it("fails an embed that has neither a track nor built-in captions", () => {
    assert.throws(
      () =>
        assertMediaVideosHaveCaptions([
          fileVideo({
            src: "https://www.youtube-nocookie.com/embed/abc123",
            captions: undefined,
            captionsBuiltIn: false,
          }),
        ]),
      /missing an English captions track/,
    );
  });

  it("fails a non-privacy embed URL", () => {
    assert.throws(
      () =>
        assertMediaVideosHaveCaptions([
          fileVideo({
            src: "https://www.youtube.com/embed/abc123",
            captionsBuiltIn: true,
          }),
        ]),
      /no-cookie or privacy embed URL/,
    );
  });

  it("prefixes graphic alt and blanks it when the figcaption repeats the description", () => {
    const unique: MediaGraphic = {
      id: "g1",
      src: "/g1.png",
      alt: "Aligners on a tray",
      caption: "A different caption",
      width: 1080,
      height: 1080,
    };
    const repeated: MediaGraphic = {
      ...unique,
      id: "g2",
      caption: "Aligners on a tray",
    };
    assert.equal(resolveGraphicAlt(unique), "Invisalign graphic: Aligners on a tray");
    assert.equal(resolveGraphicAlt(repeated), "");
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

  it("keeps graphics lazy, sized, and never priority", () => {
    const html = renderSection([], pair.graphics);
    const graphicImgs = html.match(/<img\b[^>]*>/g) ?? [];
    assert.equal(graphicImgs.length, 4);
    for (const img of graphicImgs) {
      assert.match(img, /loading="lazy"/);
      assert.match(img, /sizes="\(min-width:1024px\) 292px, 50vw"/);
      assert.equal(img.includes("priority"), false);
    }
    assert.match(html, /object-contain/);
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

describe("InvisalignMediaVideo facade", () => {
  it("renders the poster and play button without a video element", () => {
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
  });

  it("only mounts <video controls playsInline preload=\"none\"> after click in source", () => {
    const source = readFileSync(
      "client/src/components/invisalign/InvisalignMediaVideo.tsx",
      "utf8",
    );
    assert.match(source, /useState\(false\)/);
    assert.match(source, /onClick=\{\(\) => setActive\(true\)\}/);
    assert.match(source, /\{active \? \(/);
    assert.match(source, /<video/);
    assert.match(source, /controls/);
    assert.match(source, /playsInline/);
    assert.match(source, /preload="none"/);
    assert.match(source, /kind="captions"/);
    assert.match(source, /srcLang="en"/);
    assert.match(source, /label="English"/);
    assert.match(source, /<iframe/);
    assert.match(source, /aria-label=\{playLabel\}/);
    assert.match(
      source,
      /const playLabel = `Play video: \$\{video\.title\} \(\$\{video\.durationLabel\}, captions available\)`/,
    );
  });

  it("uses next/image for production posters and graphics, lazy and never priority", () => {
    const image = readFileSync(
      "client/src/components/invisalign/InvisalignMediaImage.tsx",
      "utf8",
    );
    const section = readFileSync(
      "client/src/components/invisalign/InvisalignMediaSection.tsx",
      "utf8",
    );
    const video = readFileSync(
      "client/src/components/invisalign/InvisalignMediaVideo.tsx",
      "utf8",
    );
    assert.match(image, /import Image from "next\/image"/);
    assert.match(image, /loading="lazy"/);
    assert.equal(image.includes("priority"), false);
    assert.match(image, /\(min-width:1024px\) 600px, 100vw/);
    assert.match(image, /\(min-width:1024px\) 720px, 100vw/);
    assert.match(image, /\(min-width:1024px\) 292px, 50vw/);
    assert.match(section, /InvisalignMediaImage/);
    assert.match(video, /InvisalignMediaImage/);
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
