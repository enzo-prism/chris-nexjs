import type { StoryVideoVersion } from "@/components/video/types";

// "Full Circle" — the motion film about Dr. Wong's path to dentistry and the
// practice he now leads. Self-hosted in public/videos/full-circle/ (web
// encodes made from the masters; see docs/full-circle-film.md).
const BASE = "/videos/full-circle";

export const fullCircleFilm: StoryVideoVersion = {
  id: "film",
  label: "Full film",
  title: "Full Circle — Dr. Wong’s story",
  durationSeconds: 134.272,
  aspect: "16/9",
  sources: [
    { src: `${BASE}/full-circle-720.mp4`, width: 1280 },
    { src: `${BASE}/full-circle-1080.mp4`, width: 1920 },
  ],
  poster: `${BASE}/poster-landscape-1280.jpg`,
  posterWebp: `${BASE}/poster-landscape-1280.webp`,
  teaser: `${BASE}/full-circle-teaser.mp4`,
  captions: `${BASE}/full-circle.en.vtt`,
  storyboard: {
    sprite: `${BASE}/full-circle-sprite.jpg`,
    interval: 2,
    columns: 10,
    tileWidth: 192,
    tileHeight: 108,
    count: 67,
  },
  chapters: [
    { start: 0, title: "Where it started" },
    { start: 30, title: "A second family" },
    { start: 44.8, title: "Friends on the journey" },
    { start: 56.5, title: "Passing the torch" },
    { start: 93, title: "Dr. Hamamoto’s blessing" },
    { start: 109.5, title: "Keep on growing" },
  ],
};

export const fullCircleShort: StoryVideoVersion = {
  id: "short",
  label: "Short",
  title: "Full Circle (short) — Dr. Wong’s story",
  durationSeconds: 56.267,
  aspect: "9/16",
  sources: [
    { src: `${BASE}/full-circle-vertical-720.mp4`, width: 720 },
    { src: `${BASE}/full-circle-vertical-1080.mp4`, width: 1080 },
  ],
  poster: `${BASE}/poster-vertical-720.jpg`,
  posterWebp: `${BASE}/poster-vertical-720.webp`,
  teaser: `${BASE}/full-circle-teaser-vertical.mp4`,
  captions: `${BASE}/full-circle-vertical.en.vtt`,
  burnedInCaptions: true,
  storyboard: {
    sprite: `${BASE}/full-circle-vertical-sprite.jpg`,
    interval: 2,
    columns: 10,
    tileWidth: 108,
    tileHeight: 192,
    count: 28,
  },
};
