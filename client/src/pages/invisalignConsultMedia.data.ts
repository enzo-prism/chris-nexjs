import type { MediaGraphic, MediaVideo } from "./invisalignConsultMedia";

/** Align-supplied videos. Ship empty until captioned assets are approved. */
export const INVISALIGN_CONSULT_VIDEOS: readonly MediaVideo[] = [];

/** Align-supplied graphics. Ship empty until approved stills land. */
export const INVISALIGN_CONSULT_GRAPHICS: readonly MediaGraphic[] = [];

/**
 * Literal switch for the consult page graph. Keep this in lockstep with the
 * arrays above so webpack can drop the video island while they stay empty.
 */
export const INVISALIGN_CONSULT_HAS_MEDIA = false;
