/**
 * Build social-share (Open Graph / Twitter card) derivatives of the photos
 * referenced by `ogImage` in shared/seo.ts.
 *
 * The source photos are full-resolution PNGs (2–4 MB each). Those are fine as
 * inputs to next/image, which resizes and re-encodes them for on-page use, but
 * `og:image` is served raw: the URL in the meta tag is exactly what Facebook,
 * LinkedIn, Slack, iMessage and WhatsApp fetch. Multi-megabyte PNGs make those
 * unfurls slow and, past each crawler's own size ceiling, silently dropped.
 *
 * Every source is normalized to JPEG for the same reason: WebP `og:image` is
 * not rendered by X/Twitter or LinkedIn, so a WebP share card silently loses
 * its image even though the file is small.
 *
 * This writes 1200x675 JPEGs (16:9, the source aspect, so nothing is cropped)
 * into public/images/og/. Re-run after adding or replacing an og source photo:
 *
 *   node scripts/generate-og-images.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_DIR = path.join(PUBLIC_DIR, "images", "og");
const SEO_SOURCE = path.join(ROOT, "shared", "seo.ts");

const OG_WIDTH = 1200;
const OG_HEIGHT = 675;

const collectOgSources = async () => {
  const seo = await readFile(SEO_SOURCE, "utf8");
  const matches = [
    ...seo.matchAll(/ogImage:\s*"([^"]+)"/g),
    ...seo.matchAll(/DEFAULT_OG_IMAGE\s*=\s*"([^"]+)"/g),
  ].map((m) => m[1]);
  return [...new Set(matches)];
};

const run = async () => {
  const sources = await collectOgSources();
  await mkdir(OUT_DIR, { recursive: true });

  const generated = [];
  const skipped = [];
  const missing = [];

  for (const src of sources) {
    // Already share-sized, or hosted elsewhere (nothing for us to re-encode).
    if (src.startsWith("/images/og/") || /^https?:\/\//.test(src)) continue;

    const absolute = path.join(PUBLIC_DIR, src);
    if (!existsSync(absolute)) {
      missing.push(src);
      continue;
    }

    const input = await readFile(absolute);
    const outName = `${path.basename(src, path.extname(src))}.jpg`;
    const outPath = path.join(OUT_DIR, outName);
    const buffer = await sharp(input)
      .resize(OG_WIDTH, OG_HEIGHT, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toBuffer();
    await writeFile(outPath, buffer);

    generated.push(
      `${src} -> /images/og/${outName} ` +
        `(${Math.round(input.byteLength / 1024)}kB -> ${Math.round(buffer.byteLength / 1024)}kB)`,
    );
  }

  for (const line of generated) console.log("generated", line);
  for (const line of skipped) console.log("skipped  ", line);
  for (const line of missing) console.log("MISSING  ", line);

  if (missing.length) {
    process.exitCode = 1;
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
