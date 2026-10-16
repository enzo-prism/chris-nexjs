export type StoryChapter = {
  readonly start: number;
  readonly title: string;
};

export type StoryStoryboard = {
  /** Sprite sheet of thumbnails laid out left-to-right, top-to-bottom. */
  readonly sprite: string;
  /** Seconds between thumbnails. */
  readonly interval: number;
  readonly columns: number;
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly count: number;
};

export type StorySource = {
  readonly src: string;
  /** Pixel width of the encode (e.g. 1280 for 720p landscape). */
  readonly width: number;
};

export type StoryVideoVersion = {
  readonly id: string;
  /** Visible name in the version switcher, e.g. "Full film". */
  readonly label: string;
  /** Accessible/media-session title. */
  readonly title: string;
  readonly durationSeconds: number;
  readonly aspect: "16/9" | "9/16";
  readonly sources: readonly StorySource[];
  readonly poster: string;
  /** Optional modern-format posters for the static shell (<picture>). */
  readonly posterAvif?: string;
  readonly posterWebp?: string;
  /** Silent, looping motion poster shown behind the play button. */
  readonly teaser?: string;
  readonly captions?: string;
  /** Captions are already burned into the picture (CC starts off). */
  readonly burnedInCaptions?: boolean;
  readonly chapters?: readonly StoryChapter[];
  readonly storyboard?: StoryStoryboard;
};

export function formatClock(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const seconds = Math.floor(totalSeconds);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function spokenDuration(totalSeconds: number): string {
  const seconds = Math.round(totalSeconds);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} seconds`;
  return s ? `${m} minute${m > 1 ? "s" : ""} ${s} seconds` : `${m} minute${m > 1 ? "s" : ""}`;
}
