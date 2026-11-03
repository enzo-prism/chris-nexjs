import type {
  MediaGraphic,
  MediaVideo,
} from "../client/src/pages/invisalignConsultMedia";

export const goodFile: MediaVideo = {
  kind: "file",
  id: "file-good",
  title: "Good file",
  src: "/media/invisalign/demo.mp4",
  poster: "/media/invisalign/demo.jpg",
  captions: "/media/invisalign/demo.vtt",
  durationLabel: "0:12",
};

export const goodYoutube: MediaVideo = {
  kind: "embed",
  id: "embed-yt",
  title: "Good YouTube",
  src: "https://www.youtube-nocookie.com/embed/abc123",
  poster: "/media/invisalign/yt.jpg",
  captionsBuiltIn: true,
  durationLabel: "0:18",
};

export const goodVimeo: MediaVideo = {
  kind: "embed",
  id: "embed-vimeo",
  title: "Good Vimeo",
  src: "https://player.vimeo.com/video/123?dnt=1",
  poster: "/media/invisalign/vimeo.jpg",
  captionsBuiltIn: true,
  durationLabel: "0:20",
};

export const goodGraphic: MediaGraphic = {
  id: "graphic-good",
  src: "/images/redesign/jamal-itero-scan.webp",
  alt: "A digital scan",
  caption: "The scan chair",
  width: 1080,
  height: 1080,
};

// @ts-expect-error file videos require captions
export const fileMissingCaptions: MediaVideo = {
  kind: "file",
  id: "file-no-captions",
  title: "No captions",
  src: "/media/invisalign/demo.mp4",
  poster: "/media/invisalign/demo.jpg",
  durationLabel: "0:10",
};

// @ts-expect-error embed videos require captionsBuiltIn: true
export const embedMissingBuiltIn: MediaVideo = {
  kind: "embed",
  id: "embed-no-flag",
  title: "No flag",
  src: "https://www.youtube-nocookie.com/embed/abc123",
  poster: "/media/invisalign/yt.jpg",
  durationLabel: "0:10",
};

export const embedWithCaptionsTrack: MediaVideo = {
  kind: "embed",
  id: "embed-track",
  title: "Track",
  src: "https://www.youtube-nocookie.com/embed/abc123",
  poster: "/media/invisalign/yt.jpg",
  captionsBuiltIn: true,
  // @ts-expect-error embeds cannot carry a captions track
  captions: "/media/invisalign/demo.vtt",
  durationLabel: "0:10",
};

export const fileWithBuiltIn: MediaVideo = {
  kind: "file",
  id: "file-builtin",
  title: "Built in",
  src: "/media/invisalign/demo.mp4",
  poster: "/media/invisalign/demo.jpg",
  captions: "/media/invisalign/demo.vtt",
  // @ts-expect-error file videos cannot set captionsBuiltIn
  captionsBuiltIn: true,
  durationLabel: "0:10",
};

export const fileDataUri: MediaVideo = {
  kind: "file",
  id: "file-data",
  title: "Data",
  // @ts-expect-error file videos cannot use a data URI
  src: "data:video/mp4,AAA",
  poster: "/media/invisalign/demo.jpg",
  captions: "/media/invisalign/demo.vtt",
  durationLabel: "0:10",
};

export const embedHttp: MediaVideo = {
  kind: "embed",
  id: "embed-http",
  title: "HTTP",
  // @ts-expect-error embeds cannot use http
  src: "http://www.youtube-nocookie.com/embed/abc123",
  poster: "/media/invisalign/yt.jpg",
  captionsBuiltIn: true,
  durationLabel: "0:10",
};

// @ts-expect-error youtube.com is not the privacy host
export const embedYoutubeCom: MediaVideo = {
  kind: "embed",
  id: "embed-youtube",
  title: "YouTube",
  src: "https://www.youtube.com/embed/abc123",
  poster: "/media/invisalign/yt.jpg",
  captionsBuiltIn: true,
  durationLabel: "0:10",
};

export const graphicDataUri: MediaGraphic = {
  id: "graphic-data",
  // @ts-expect-error production graphics cannot use a data URI
  src: "data:image/png,AAAA",
  alt: "A still",
  width: 1080,
  height: 1080,
};

export const fileEmptySrc: MediaVideo = {
  kind: "file",
  id: "file-empty",
  title: "Empty",
  // @ts-expect-error file videos cannot use an empty src
  src: "",
  poster: "/media/invisalign/demo.jpg",
  captions: "/media/invisalign/demo.vtt",
  durationLabel: "0:10",
};

export const fileHttp: MediaVideo = {
  kind: "file",
  id: "file-http",
  title: "HTTP file",
  // @ts-expect-error file videos cannot use http
  src: "http://example.com/demo.mp4",
  poster: "/media/invisalign/demo.jpg",
  captions: "/media/invisalign/demo.vtt",
  durationLabel: "0:10",
};

export const fileBlob: MediaVideo = {
  kind: "file",
  id: "file-blob",
  title: "Blob",
  // @ts-expect-error file videos cannot use a blob URI
  src: "blob:https://example.com/abc",
  poster: "/media/invisalign/demo.jpg",
  captions: "/media/invisalign/demo.vtt",
  durationLabel: "0:10",
};

// @ts-expect-error Vimeo embeds must include dnt=1 in the typed src
export const embedVimeoWithoutDnt: MediaVideo = {
  kind: "embed",
  id: "embed-vimeo-no-dnt",
  title: "Vimeo no DNT",
  src: "https://player.vimeo.com/video/123",
  poster: "/media/invisalign/vimeo.jpg",
  captionsBuiltIn: true,
  durationLabel: "0:10",
};

export const graphicBlob: MediaGraphic = {
  id: "graphic-blob",
  // @ts-expect-error production graphics cannot use a blob URI
  src: "blob:https://example.com/abc",
  alt: "A still",
  width: 1080,
  height: 1080,
};
