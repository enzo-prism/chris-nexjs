# Gallery Feature Guide

Operational guide for `/gallery`.

## Purpose

The gallery is a media-first showcase page designed to highlight office photos and videos with minimal UI chrome.

Current interaction model:
- Editorial minimal layout.
- Hero video autoplay muted with unmute toggle.
- In-grid videos are click-to-play, muted loop.
- Fullscreen lightbox with keyboard and swipe support.

## Source files

- Page composition:
  - `client/src/pages/Gallery.tsx`
- Media dataset:
  - `client/src/data/galleryMedia.ts`
- Tile component:
  - `client/src/components/gallery/GalleryTile.tsx`
- Lightbox component:
  - `client/src/components/gallery/GalleryLightbox.tsx`

## Media data contract

`GalleryMediaItem` fields:
- `id`
- `kind` (`image` or `video`)
- `src`
- `poster` (optional, for videos)
- `alt`
- `title`
- `description`
- `layout` (`videoWide`, `photoStandard`, `photoTall`)
- `interaction` (`heroAutoplayMuted`, `tapToPlayLoopMuted`, `staticImage`)

Notes:
- `title` and `description` are metadata fields for maintainability and SEO context.
- Card UI intentionally does not render text overlays.

## Adding or updating media

1. Edit `client/src/data/galleryMedia.ts`.
2. Use unique `id` values.
3. Keep URLs HTTPS only.
4. Provide accurate `alt` text.
5. Set layout to control visual rhythm:
  - `videoWide` for featured clips
  - `photoStandard` for most stills
  - `photoTall` for portrait emphasis
6. Set correct interaction mode:
  - hero media: `heroAutoplayMuted`
  - in-grid videos: `tapToPlayLoopMuted`
  - images: `staticImage`

## QA checklist

- Hero video starts muted and can be toggled mute/unmute.
- In-grid videos stay paused until clicked.
- In-grid videos pause when out of viewport.
- Lightbox opens from any tile.
- Lightbox navigation works:
  - `Esc` closes
  - left/right arrows navigate
  - swipe works on touch devices
- No visible per-card text blocks.
- Video tiles are visually larger than photo tiles on `md+`.

## Automated checks

Run:

```bash
pnpm run test:gallery
pnpm run test:images
pnpm run test:routes
```

The gallery contract test validates:
- unique IDs and URLs
- HTTPS-only media sources
- allowed `kind`/`layout`/`interaction` values
- required metadata fields
