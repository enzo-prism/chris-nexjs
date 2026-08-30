import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { galleryItems, heroVideo } from "../client/src/data/galleryMedia";

const allowedKinds = new Set(["image", "video"]);
const allowedLayouts = new Set(["videoWide", "photoStandard", "photoTall"]);
const allowedInteractions = new Set([
  "tapToPlayLoopMuted",
  "staticImage",
]);
const allowedCategories = new Set([
  "Our Space",
  "Patient Care",
  "Technology",
  "Our Team",
]);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function isHttpsUrl(value: string): boolean {
  return value.startsWith("https://") || value.startsWith("/");
}

const mediaPool = [heroVideo, ...galleryItems];
const idSet = new Set<string>();
const srcSet = new Set<string>();
const galleryImageSrcSet = new Set(
  galleryItems.filter((item) => item.kind === "image").map((item) => item.src),
);
const videoPosterSet = new Set<string>();
const repoRoot = fileURLToPath(new URL("../", import.meta.url));

for (const media of mediaPool) {
  assert(!idSet.has(media.id), `Duplicate media id detected: ${media.id}`);
  idSet.add(media.id);

  assert(!srcSet.has(media.src), `Duplicate media src detected: ${media.src}`);
  srcSet.add(media.src);

  assert(allowedKinds.has(media.kind), `Invalid media kind: ${media.kind}`);
  assert(
    allowedLayouts.has(media.layout),
    `Invalid media layout: ${media.layout}`,
  );
  assert(
    allowedInteractions.has(media.interaction),
    `Invalid media interaction: ${media.interaction}`,
  );
  assert(
    allowedCategories.has(media.category),
    `Invalid media category: ${media.category} in ${media.id}`,
  );
  assert(isHttpsUrl(media.src), `Media src must be HTTPS or relative: ${media.src}`);
  assert(media.alt.trim().length > 0, `Media alt is required: ${media.id}`);
  assert(media.title.trim().length > 0, `Media title is required: ${media.id}`);
  assert(
    media.description.trim().length > 0,
    `Media description is required: ${media.id}`,
  );

  if (media.poster) {
    assert(
      isHttpsUrl(media.poster),
      `Media poster must be HTTPS: ${media.poster}`,
    );

    assert(
      !videoPosterSet.has(media.poster),
      `Duplicate video poster detected: ${media.poster}`,
    );
    videoPosterSet.add(media.poster);

    assert(
      !galleryImageSrcSet.has(media.poster),
      `Video poster duplicates a gallery image tile src: ${media.poster} (${media.id})`,
    );
  }
}

assert(
  heroVideo.interaction === "tapToPlayLoopMuted",
  "Hero video must require an explicit play interaction",
);

const videoMedia = mediaPool.filter((item) => item.kind === "video");

for (const media of videoMedia) {
  assert(media.poster, `Video poster is required: ${media.id}`);
  assert(
    media.poster.startsWith("/"),
    `Video poster must be an inspectable local asset: ${media.id}`,
  );
  assert(
    media.poster.endsWith(".webp"),
    `Video poster must use WebP: ${media.id}`,
  );

  const posterPath = join(repoRoot, "public", media.poster.slice(1));
  const posterBytes = statSync(posterPath).size;
  const maxPosterBytes = media.id === heroVideo.id ? 100 * 1024 : 500 * 1024;
  assert(
    posterBytes <= maxPosterBytes,
    `${media.id} poster is ${Math.round(posterBytes / 1024)}kB; budget is ${Math.round(maxPosterBytes / 1024)}kB`,
  );
}

const galleryPageSource = readFileSync(
  join(repoRoot, "client/src/pages/Gallery.tsx"),
  "utf8",
);
const galleryTileSource = readFileSync(
  join(repoRoot, "client/src/components/gallery/GalleryTile.tsx"),
  "utf8",
);

const heroInteractionGate = galleryPageSource.indexOf(
  "{hasRequestedVideo && !videoErrored && (",
);
const heroVideoMount = galleryPageSource.indexOf("<video", heroInteractionGate);
assert(heroInteractionGate >= 0, "Hero video must have an interaction gate");
assert(
  heroVideoMount > heroInteractionGate,
  "Hero MP4 must only mount after explicit user interaction",
);
assert(
  galleryPageSource.includes('preload="none"'),
  "Hero video must disable preloading",
);
assert(
  !galleryPageSource.includes("autoPlay"),
  "Gallery hero must not autoplay",
);
assert(
  !galleryPageSource.includes("Trusted by 2,000+ patients"),
  "Gallery must not render an unsupported patient count",
);

const tileInteractionGate = galleryTileSource.indexOf(
  "{videoRequested && !videoErrored ? (",
);
const tileVideoMount = galleryTileSource.indexOf("<video", tileInteractionGate);
assert(tileInteractionGate >= 0, "Gallery video tiles must have an interaction gate");
assert(
  tileVideoMount > tileInteractionGate,
  "Gallery tile MP4s must only mount after explicit user interaction",
);
assert(
  galleryTileSource.includes('preload="none"'),
  "Gallery tile videos must disable preloading",
);
assert(
  galleryTileSource.includes("import Image from \"next/image\""),
  "Gallery tiles must use next/image",
);
assert(
  !galleryTileSource.includes("<img"),
  "Gallery tiles must not use unoptimized img elements",
);

const galleryVideoCount = galleryItems.filter((item) => item.kind === "video").length;
const wideMediaCount = galleryItems.filter((item) => item.layout === "videoWide").length;

assert(galleryVideoCount > 0, "Gallery must include at least one video");
assert(wideMediaCount > 0, "Gallery must include at least one videoWide media item");

console.log(
  `Gallery media contract passed: ${galleryItems.length} items + 1 hero video`,
);
