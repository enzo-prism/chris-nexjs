import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildBlogListSchemas,
  buildProfilePageSchema,
  buildVideoObjectSchemas,
} from "../client/src/lib/structuredData";
import { isValidIsoDateTime } from "../shared/isoDateTime";

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
