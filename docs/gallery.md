# Gallery Feature Guide

Operational guide for `/gallery`.

## Purpose

The gallery is a media-first showcase page designed to scan quickly while
keeping the complete source frame available in the lightbox.

Current interaction model:
- Hero and in-grid videos request no video bytes until the visitor presses play.
- In-grid videos are click-to-play, muted loop.
- Tiles use concise accessible names; the fullscreen lightbox exposes the title
  and description to assistive technology and supports keyboard and swipe
  navigation.

## Source files

- Page composition: `client/src/pages/Gallery.tsx`
- Media dataset: `client/src/data/galleryMedia.ts`
- Tile component: `client/src/components/gallery/GalleryTile.tsx`
- Lightbox component: `client/src/components/gallery/GalleryLightbox.tsx`
- Contract test: `scripts/gallery-media.test.ts`

## Rendering architecture

The grid uses intentional editorial frames for a stable, scannable layout:

- Still images (`kind: "image"`)
  - Use responsive `next/image` delivery with explicit `sizes`
  - Use `4:3` or `4:5` tile frames with `object-cover`
  - Show the complete uncropped image with `object-contain` in the lightbox
- Videos (`kind: "video"`)
  - Use stable poster frames before interaction
  - Keep the MP4 source out of the DOM until explicit play
  - Show the complete video with `object-contain` in the lightbox

## Media data contract

`GalleryMediaItem` fields:
- `id`
- `kind` (`image` or `video`)
- `src`
- `poster` (optional, for videos)
- `alt`
- `title`
- `description`
- `category` (`Our Space`, `Patient Care`, `Technology`, `Our Team`)
- `layout` (`videoWide`, `photoStandard`, `photoTall`)
- `interaction` (`tapToPlayLoopMuted` or `staticImage`)

Notes:
- `title` and `description` are required metadata fields.
- Tile controls expose the title to assistive technology; the lightbox exposes
  the title and description through its accessible dialog semantics.

## Current still-image pack (Cloudinary)

As of 2026-03-04, still-image tiles use this explicit set:

- `https://res.cloudinary.com/dhqpqfw6w/image/upload/v1762989225/Post-2_hdbi3u.webp`
- `https://res.cloudinary.com/dhqpqfw6w/image/upload/v1762989225/Post-5_dib4rp.webp`
- `https://res.cloudinary.com/dhqpqfw6w/image/upload/v1762989225/Post_e0ayi2.webp`
- `https://res.cloudinary.com/dhqpqfw6w/image/upload/v1762989226/Post-7_d8rmrk.webp`
- `https://res.cloudinary.com/dhqpqfw6w/image/upload/v1762989226/Post-8_jmfidt.webp`
- `https://res.cloudinary.com/dhqpqfw6w/image/upload/v1762989226/Post-11_nohz6f.webp`
- `https://res.cloudinary.com/dhqpqfw6w/image/upload/v1762989226/Post-6_uhnnyg.webp`
- `https://res.cloudinary.com/dhqpqfw6w/image/upload/v1762989226/Post-13_vdeedx.webp`
- `https://res.cloudinary.com/dhqpqfw6w/image/upload/v1762989227/Polaroids_iep3fj.webp`

## Adding or updating media

1. Edit `client/src/data/galleryMedia.ts`.
2. Use unique `id` values.
3. Keep URLs HTTPS only.
4. Provide accurate `alt` text.
5. Assign layout:
   - `videoWide` for featured clips
   - `photoStandard` for most stills
   - `photoTall` for portrait emphasis
6. Assign interaction:
   - hero and in-grid videos: `tapToPlayLoopMuted`
   - in-grid videos: `tapToPlayLoopMuted`
   - images: `staticImage`
7. Keep video posters distinct from still-image tile sources to avoid visible duplicates.

## QA checklist

- Hero video does not load until clicked, then starts muted and can be unmuted.
- In-grid videos stay paused until clicked.
- In-grid videos pause when out of viewport.
- Lightbox opens from any tile.
- Lightbox navigation works:
  - `Esc` closes
  - left/right arrows navigate
  - swipe works on touch devices
- Editorial tile crops remain visually appropriate at `sm`, `md`, `lg`, and
  `xl`; the lightbox preserves every complete source frame.
- No duplicated poster/still visual surfaces in the same gallery state.

## Automated checks

Run:

```bash
pnpm run test:gallery
pnpm run test:images
pnpm run test:routes
```

`test:gallery` currently validates:
- unique media IDs
- unique media source URLs
- HTTPS/relative media paths
- allowed `kind`/`layout`/`interaction`/`category` values
- required `alt`/`title`/`description` metadata
- no duplicate video posters
- no overlap between video posters and still-image tile sources
