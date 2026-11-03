export type MediaVideo = {
  readonly src: string;
  readonly poster: string;
  readonly title: string;
  readonly captionsSrc: string;
  readonly runtime: string;
};

export type MediaGraphic = {
  readonly src: string;
  readonly alt: string;
  readonly caption?: string;
};

export function assertMediaVideosHaveCaptions(
  videos: readonly MediaVideo[],
): void {
  for (const [index, video] of videos.entries()) {
    if (!video.captionsSrc.trim()) {
      throw new Error(
        `Invisalign media video "${video.title || index}" is missing an English captions track`,
      );
    }
  }
}

/** Align-supplied videos. Ship empty until captioned assets are approved. */
export const INVISALIGN_CONSULT_VIDEOS: readonly MediaVideo[] = [];

/** Align-supplied graphics. Ship empty until approved stills land. */
export const INVISALIGN_CONSULT_GRAPHICS: readonly MediaGraphic[] = [];

assertMediaVideosHaveCaptions(INVISALIGN_CONSULT_VIDEOS);
