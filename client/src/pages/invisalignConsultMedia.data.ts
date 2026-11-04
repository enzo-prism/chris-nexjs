import type { MediaGraphic, MediaVideo } from "./invisalignConsultMedia";

/** Full Align provider video from the Practice Marketing catalog. */
export const INVISALIGN_CONSULT_VIDEOS: readonly MediaVideo[] = [
  {
    kind: "file",
    id: "align-oral-health",
    title: "Invisalign and oral health",
    src: "https://ocq09yvkilexm759.public.blob.vercel-storage.com/videos/invisalign/oral-health-captioned.mp4",
    poster: "https://ocq09yvkilexm759.public.blob.vercel-storage.com/videos/invisalign/oral-health-poster.webp",
    captionsBuiltIn: true,
    durationLabel: "3:20",
  },
];

/** Align-supplied graphics. Ship empty until approved stills land. */
export const INVISALIGN_CONSULT_GRAPHICS: readonly MediaGraphic[] = [];

/**
 * Literal switch for the consult page graph. Keep this in lockstep with the
 * arrays above so webpack can drop the video island while they stay empty.
 */
export const INVISALIGN_CONSULT_HAS_MEDIA = true;
