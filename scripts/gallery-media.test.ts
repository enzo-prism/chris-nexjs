import { galleryItems, heroVideo } from "../client/src/data/galleryMedia";

const allowedKinds = new Set(["image", "video"]);
const allowedLayouts = new Set(["videoWide", "photoStandard", "photoTall"]);
const allowedInteractions = new Set([
  "heroAutoplayMuted",
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
  }
}

assert(
  heroVideo.interaction === "heroAutoplayMuted",
  "Hero video must use heroAutoplayMuted interaction",
);

const galleryVideoCount = galleryItems.filter((item) => item.kind === "video").length;
const wideMediaCount = galleryItems.filter((item) => item.layout === "videoWide").length;

assert(galleryVideoCount > 0, "Gallery must include at least one video");
assert(wideMediaCount > 0, "Gallery must include at least one videoWide media item");

console.log(
  `Gallery media contract passed: ${galleryItems.length} items + 1 hero video`,
);
