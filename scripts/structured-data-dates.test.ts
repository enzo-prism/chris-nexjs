import assert from "node:assert/strict";
import fs from "node:fs";
import { register } from "node:module";
import { describe, it } from "node:test";
import React, { createElement } from "react";
import { renderToString } from "react-dom/server";
import { blogIndex } from "../client/src/data/blogIndex";
import { galleryItems, heroVideo } from "../client/src/data/galleryMedia";
import {
  blogPostingDateFields,
  buildBlogListSchemas,
  buildProfilePageSchema,
  buildVideoObjectSchemas,
} from "../client/src/lib/structuredData";
import { isValidIsoDateTime, toPacificDateTime } from "../shared/isoDateTime";

register("./ssr-next-stub-loader.mjs", import.meta.url);
(globalThis as { React?: typeof React }).React = React;

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

describe("buildProfilePageSchema dates", () => {
  it("passes DateTime fields through and omits date-only lastmod guesses", () => {
    const schema = buildProfilePageSchema({
      dateModified: "2026-10-28T00:00:00-07:00",
      datePublished: "2026-10-16T09:00:00-07:00",
    });
    assert.equal(schema.dateModified, "2026-10-28T00:00:00-07:00");
    assert.equal(schema.datePublished, "2026-10-16T09:00:00-07:00");
    assert.equal(isValidIsoDateTime(String(schema.dateModified)), true);
    assert.equal(isValidIsoDateTime(String(schema.datePublished)), true);
  });
});

describe("blogPostingDateFields", () => {
  it("omits both date fields instead of throwing when the date is unparseable", () => {
    assert.doesNotThrow(() => blogPostingDateFields("not a date"));
    assert.deepEqual(blogPostingDateFields("not a date"), {});
    assert.deepEqual(blogPostingDateFields("2026-02-30"), {});
    assert.deepEqual(blogPostingDateFields("2026-10-28T00:00:00"), {});
  });

  it("attaches matching Pacific DateTimes when the date parses", () => {
    assert.deepEqual(blogPostingDateFields("2026-06-23"), {
      datePublished: "2026-06-23T00:00:00-07:00",
      dateModified: "2026-06-23T00:00:00-07:00",
    });
  });

  it("BlogPost.tsx executable source has no throw keyword", () => {
    const source = stripComments(fs.readFileSync("client/src/pages/BlogPost.tsx", "utf8"));
    assert.match(source, /const dateFields = blogPostingDateFields\(post\.date\)/);
    assert.doesNotMatch(source, /\bthrow\b/);
  });

  it("renders BlogPost with an unparseable date without throwing", async () => {
    const post = {
      id: 9001,
      title: "Synthetic bad date",
      content: "Synthetic article body.",
      image: "/images/dr_wong_polaroids.png",
      date: "not a date",
      slug: "synthetic-bad-date",
      category: "family",
      readTime: 3,
      relatedServices: [] as string[],
    };
    assert.throws(
      () => new Date(post.date).toISOString(),
      RangeError,
      "control: the #30 Date.toISOString crash class still throws",
    );
    const { default: BlogPost } = await import("../client/src/pages/BlogPost");
    assert.doesNotThrow(() => {
      renderToString(
        createElement(BlogPost, {
          params: { slug: post.slug },
          initialPosts: [post],
        }),
      );
    });
  });
});

describe("buildBlogListSchemas dates", () => {
  it("emits Pacific DateTimes instead of date-only published values", () => {
    const [blog] = buildBlogListSchemas([
      { title: "Sample", slug: "sample", date: "March 29, 2026" },
    ]);
    const posts = (blog as { blogPost: Array<{ datePublished?: string }> }).blogPost;
    assert.equal(posts[0]?.datePublished, "2026-03-29T00:00:00-07:00");
  });
});

describe("buildVideoObjectSchemas dates", () => {
  it("expands a date-only uploadDate to midnight Pacific", () => {
    const [video] = buildVideoObjectSchemas(
      [
        {
          id: "tour",
          title: "Office tour clip",
          description: "A short look around the office.",
          src: "/videos/office-atrium.mp4",
          poster: "/images/tour/office-atrium-poster.webp",
          uploadDate: "2026-06-23",
        },
      ],
      "/office-tour",
    );
    assert.equal(video.uploadDate, "2026-06-23T00:00:00-07:00");
  });

  it("derives a full offset DateTime from a Cloudinary version segment", () => {
    const [video] = buildVideoObjectSchemas(
      [
        {
          id: "hero",
          title: "Office highlights",
          description: "A short look around the office.",
          src: "https://res.cloudinary.com/dhqpqfw6w/video/upload/v1772057711/chris_wong_dds_lgbxf4.mp4",
          poster: "/images/hero-office-1280.webp",
        },
      ],
      "/gallery",
    );
    assert.equal(video.uploadDate, "2026-02-25T14:15:11-08:00");
    assert.equal(isValidIsoDateTime(String(video.uploadDate)), true);
  });
});

describe("/blog and /gallery dates without longOffset", () => {
  const OriginalDateTimeFormat = Intl.DateTimeFormat;

  function rejectLongOffset(): () => void {
    const Stub = function (
      this: unknown,
      locales?: string | string[],
      options?: Intl.DateTimeFormatOptions,
    ) {
      if (options?.timeZoneName === "longOffset") {
        throw new RangeError("Invalid option : longOffset");
      }
      return new OriginalDateTimeFormat(locales, options);
    } as unknown as typeof Intl.DateTimeFormat;
    Object.defineProperty(Stub, "supportedLocalesOf", {
      value: OriginalDateTimeFormat.supportedLocalesOf.bind(OriginalDateTimeFormat),
    });
    Intl.DateTimeFormat = Stub;
    return () => {
      Intl.DateTimeFormat = OriginalDateTimeFormat;
    };
  }

  it("keeps every blog index date parseable so BlogPosting cannot drop datePublished", () => {
    assert.ok(blogIndex.length > 0, "blog index must not be empty");
    for (const post of blogIndex) {
      const iso = toPacificDateTime(post.date);
      assert.ok(iso, `${post.slug} date must parse`);
      assert.equal(isValidIsoDateTime(iso ?? ""), true);
    }
  });

  it("still builds /blog and /gallery schema when longOffset throws", () => {
    const restore = rejectLongOffset();
    try {
      const [blog] = buildBlogListSchemas(
        blogIndex.map((post) => ({
          title: post.title,
          slug: post.slug,
          date: post.date,
        })),
      );
      const posts = (blog as { blogPost: Array<{ datePublished?: string }> }).blogPost;
      assert.ok(posts.length > 0);
      for (const post of posts) {
        assert.ok(post.datePublished, "BlogPosting datePublished is required");
        assert.equal(isValidIsoDateTime(post.datePublished ?? ""), true);
      }

      const videos = buildVideoObjectSchemas(
        [heroVideo, ...galleryItems.filter((item) => item.kind === "video")],
        "/gallery",
      );
      assert.ok(videos.length > 0);
      for (const video of videos) {
        assert.ok(video.uploadDate, "gallery VideoObject uploadDate is required");
        assert.equal(isValidIsoDateTime(String(video.uploadDate)), true);
      }
    } finally {
      restore();
    }
  });
});
