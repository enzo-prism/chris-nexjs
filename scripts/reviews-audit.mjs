import fs from "node:fs";
import path from "node:path";

const rawPath = path.resolve("attached_assets/google-reviews-export-319.txt");
const generatedPath = path.resolve("shared/googleReviewsData.ts");
const shouldAssert = process.argv.includes("--assert");
const PUBLISHED_REVIEW_RATING = 5;

function parseRawExport(content) {
  const blocks = content
    .split(/\n-{3,}\n/g)
    .map((block) => block.trim())
    .filter((block) => block.includes("Review #"));

  const ratingCounts = new Map([
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
  ]);

  let noTextCount = 0;
  let publishedNoTextCount = 0;
  for (const block of blocks) {
    let rating = null;
    const starsMatch = block.match(/Stars:\s*(\d)\/5/);
    if (starsMatch) {
      rating = Number(starsMatch[1]);
      ratingCounts.set(rating, (ratingCounts.get(rating) ?? 0) + 1);
    }

    const reviewMatch = block.match(/Review:\s*([\s\S]*?)\s*$/);
    if (reviewMatch?.[1]?.trim() === "[No text]") {
      noTextCount += 1;
      if (rating === PUBLISHED_REVIEW_RATING) {
        publishedNoTextCount += 1;
      }
    }
  }

  return {
    total: blocks.length,
    noTextCount,
    publishedTotal: ratingCounts.get(PUBLISHED_REVIEW_RATING) ?? 0,
    publishedNoTextCount,
    ratings: ratingCounts,
  };
}

function parseGeneratedReviews(content) {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith('{"name":'));

  const rows = lines.map((line) => {
    const normalized = line.endsWith(",") ? line.slice(0, -1) : line;
    return JSON.parse(normalized);
  });

  const ratingCounts = new Map([
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
  ]);

  let placeholderNoTextCount = 0;
  let emptyTextCount = 0;
  for (const row of rows) {
    const rating = Number(row.rating);
    ratingCounts.set(rating, (ratingCounts.get(rating) ?? 0) + 1);
    if (typeof row.text !== "string" || row.text.trim().length === 0) {
      emptyTextCount += 1;
    }
    if (typeof row.text === "string" && /no additional comment\.$/i.test(row.text)) {
      placeholderNoTextCount += 1;
    }
  }

  return {
    total: rows.length,
    placeholderNoTextCount,
    emptyTextCount,
    ratings: ratingCounts,
  };
}

function formatRatings(ratings) {
  return {
    1: ratings.get(1) ?? 0,
    2: ratings.get(2) ?? 0,
    3: ratings.get(3) ?? 0,
    4: ratings.get(4) ?? 0,
    5: ratings.get(5) ?? 0,
  };
}

function run() {
  if (!fs.existsSync(rawPath)) {
    throw new Error(`Raw review export not found at ${rawPath}`);
  }
  if (!fs.existsSync(generatedPath)) {
    throw new Error(`Generated review data not found at ${generatedPath}`);
  }

  const raw = parseRawExport(fs.readFileSync(rawPath, "utf8"));
  const generated = parseGeneratedReviews(fs.readFileSync(generatedPath, "utf8"));

  const summary = {
    raw: {
      total: raw.total,
      noTextCount: raw.noTextCount,
      publishedTotal: raw.publishedTotal,
      publishedNoTextCount: raw.publishedNoTextCount,
      ratings: formatRatings(raw.ratings),
    },
    generated: {
      total: generated.total,
      placeholderNoTextCount: generated.placeholderNoTextCount,
      emptyTextCount: generated.emptyTextCount,
      ratings: formatRatings(generated.ratings),
    },
  };

  console.log(JSON.stringify(summary, null, 2));

  if (!shouldAssert) {
    return;
  }

  const failures = [];
  if (generated.total < 300) {
    failures.push(`Generated review count too low: ${generated.total} (expected >= 300)`);
  }
  if (generated.total !== raw.publishedTotal) {
    failures.push(
      `Generated review count mismatch: generated=${generated.total}, published=${raw.publishedTotal}`,
    );
  }
  if (generated.emptyTextCount > 0) {
    failures.push(`Found ${generated.emptyTextCount} generated reviews with empty text`);
  }
  if (generated.placeholderNoTextCount !== raw.publishedNoTextCount) {
    failures.push(
      `No-text conversion mismatch: generated placeholders=${generated.placeholderNoTextCount}, published [No text]=${raw.publishedNoTextCount}`,
    );
  }

  for (const rating of [1, 2, 3, 4, 5]) {
    const rawCount =
      rating === PUBLISHED_REVIEW_RATING
        ? raw.ratings.get(rating) ?? 0
        : 0;
    const generatedCount = generated.ratings.get(rating) ?? 0;
    if (rawCount !== generatedCount) {
      failures.push(
        `Rating distribution mismatch for ${rating}-star: generated=${generatedCount}, published=${rawCount}`,
      );
    }
  }

  if (failures.length) {
    console.error("\nReview data integrity check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("\nReview data integrity check passed.");
}

run();
