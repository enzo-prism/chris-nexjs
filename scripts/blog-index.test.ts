/**
 * Drift check for client/src/data/blogIndex.ts (generated from the blog seed).
 *
 * Fails when the committed index differs from what
 * scripts/generate-blog-index.ts would write today, when an excerpt is too
 * long, or when the file grows past its browser budget.
 *
 * Usage: pnpm exec tsx scripts/blog-index.test.ts
 */
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import {
  BLOG_INDEX_PATH,
  EXCERPT_MAX,
  buildBlogIndexRecords,
  buildBlogIndexSource,
} from "./generate-blog-index";

// The index is imported by client components on service pages, so keep it
// small. Raise deliberately (and check the bundle budget) if the blog grows.
const MAX_INDEX_BYTES = 24 * 1024;

async function run(): Promise<void> {
  const relativePath = path.relative(process.cwd(), BLOG_INDEX_PATH);
  assert.ok(fs.existsSync(BLOG_INDEX_PATH), `${relativePath} is missing. Run: pnpm exec tsx scripts/generate-blog-index.ts`);

  const committed = fs.readFileSync(BLOG_INDEX_PATH, "utf8");
  const expected = await buildBlogIndexSource();
  assert.equal(
    committed,
    expected,
    `${relativePath} is out of date with the blog seed in server/storage.ts. Run: pnpm exec tsx scripts/generate-blog-index.ts`,
  );

  const records = await buildBlogIndexRecords();
  assert.ok(records.length > 0, "Expected at least one seeded blog post");

  const slugs = new Set<string>();
  for (const record of records) {
    assert.ok(!slugs.has(record.slug), `Duplicate blog slug in index: ${record.slug}`);
    slugs.add(record.slug);
    assert.ok(record.title.trim().length > 0, `Missing title for ${record.slug}`);
    assert.ok(record.excerpt.length > 0, `Missing excerpt for ${record.slug}`);
    assert.ok(
      record.excerpt.length <= EXCERPT_MAX,
      `Excerpt for ${record.slug} is ${record.excerpt.length} chars (max ${EXCERPT_MAX})`,
    );
    assert.ok(!/[[\]()#*_`]/.test(record.excerpt), `Excerpt for ${record.slug} still contains markdown`);
  }

  const bytes = Buffer.byteLength(committed);
  assert.ok(bytes <= MAX_INDEX_BYTES, `${relativePath} is ${bytes} bytes (budget ${MAX_INDEX_BYTES})`);

  console.log(`[blog-index] OK: ${records.length} posts, ${bytes} bytes, in sync with the seed.`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
