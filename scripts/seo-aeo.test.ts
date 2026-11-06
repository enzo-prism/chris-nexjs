import assert from "node:assert/strict";
import { register } from "node:module";
import { describe, it } from "node:test";
import React, { createElement } from "react";
import { renderToString } from "react-dom/server";
import { articleUpdatedDate } from "../shared/clinicalResources";
import { checkIndexableResponse } from "../shared/indexingReadiness";
import { getSegmentEntries } from "../app/sitemap-xml-utils";
import { generateMetadata } from "../app/[...slug]/page";
import { getStorage } from "../server/storage/repository";

register("./ssr-next-stub-loader.mjs", import.meta.url);
(globalThis as { React?: typeof React }).React = React;

describe("patient-guide publication integrity", () => {
  it("keeps publication, actual editorial modification, and clinical review distinct", async () => {
    const { default: BlogPost } = await import("../client/src/pages/BlogPost");
    const storage = await getStorage();
    const posts = await storage.getBlogPosts();
    const slug = "how-long-does-invisalign-take";
    const originalDate = posts.find((post) => post.slug === slug)?.date;
    const html = renderToString(createElement(BlogPost, { params: { slug }, initialPosts: posts }));
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .flatMap((match) => JSON.parse(match[1]));
    const article = schemas.find((schema) => schema["@type"] === "BlogPosting");
    assert.equal(article.datePublished, "2026-03-14T00:00:00-07:00");
    assert.equal(article.dateModified, "2026-11-06T00:00:00-08:00");
    assert.equal(article.author["@type"], "Organization");
    assert.equal(article.reviewedBy, undefined);
    assert.ok(article.citation.includes("https://www.invisalign.com/how-it-works"));
    assert.match(html, /Sources and further reading/);
    assert.match(html, /Updated <time/);
    assert.doesNotMatch(html, /Clinically reviewed by/);
    assert.equal(posts.find((post) => post.slug === slug)?.date, originalDate);

    const entries = await getSegmentEntries("blog");
    assert.equal(entries.find((entry) => entry.url.endsWith(`/${slug}`))?.lastmod, "2026-11-06");
    const meta = await generateMetadata({ params: { slug: ["blog", slug] } });
    assert.equal((meta.openGraph as { modifiedTime?: string }).modifiedTime, article.dateModified);
  });

  it("does not refresh unrelated, invalid, or future publication dates", () => {
    assert.equal(articleUpdatedDate("unrelated", "March 14, 2026"), "March 14, 2026");
    assert.equal(articleUpdatedDate("how-long-does-invisalign-take", "not a date"), "not a date");
    assert.equal(articleUpdatedDate("how-long-does-invisalign-take", "2027-01-01"), "2027-01-01");
  });

  it("renders useful guide and canonical service links without client execution", async () => {
    const { PatientDecisionGuides } = await import("../client/src/components/common/PatientDecisionGuides");
    const html = renderToString(createElement(PatientDecisionGuides, { id: "test-guides" }));
    for (const path of ["/blog/how-long-does-invisalign-take", "/dental-veneers", "/crowns-palo-alto", "/dental-implants"]) {
      assert.ok(html.includes(`href="${path}"`), path);
    }
    assert.doesNotMatch(html, /<script|\/blog\/dental-veneers-palo-alto/);
  });
});

describe("crawl readiness distinguishes fetchability from index status", () => {
  const canonical = "https://www.chriswongdds.com/invisalign";
  const html = `<link href="${canonical}" rel="canonical"><meta name="robots" content="index, follow"><main><h1>Invisalign</h1><p>${"A substantive patient explanation. ".repeat(12)}</p></main>`;
  it("accepts initial HTML but rejects noindex headers, alternate canonicals, and client-only shells", () => {
    const input = { html, status: 200, canonical, xRobotsTag: null };
    assert.deepEqual(checkIndexableResponse(input), []);
    assert.ok(checkIndexableResponse({ ...input, xRobotsTag: "noindex" }).length);
    assert.ok(checkIndexableResponse({ ...input, status: 301 }).length);
    assert.ok(checkIndexableResponse({ ...input, canonical: `${canonical}-consult` }).length);
    assert.ok(checkIndexableResponse({ ...input, html: `<script>${JSON.stringify(html)}</script>` }).length);
    assert.ok(checkIndexableResponse({ ...input, html: html.replace('content="index, follow"', 'content="noindex, follow"') }).length);
  });
});
