# Gallery Feature Guide

Operational guide for `/gallery`.

## Purpose

The gallery is a media-first showcase page designed to present office visuals without clipping critical image content.

Current interaction model:
- Hero video autoplay muted with unmute toggle.
- In-grid videos are click-to-play, muted loop.
- Hover metadata overlays are visible on tiles.
- Fullscreen lightbox supports keyboard and swipe navigation.

## Source files

- Page composition: `client/src/pages/Gallery.tsx`
- Media dataset: `client/src/data/galleryMedia.ts`
- Tile component: `client/src/components/gallery/GalleryTile.tsx`
- Lightbox component: `client/src/components/gallery/GalleryLightbox.tsx`
- Contract test: `scripts/gallery-media.test.ts`

## Rendering architecture (no-crop mode)

The grid now uses a mixed sizing strategy to avoid image cut-off:

- Still images (`kind: "image"`)
  - Render as intrinsic-ratio media (`img` with `h-auto w-full`)
  - Use `object-contain` semantics to preserve the entire frame
  - Do not force `aspect-*` classes for stills
- Videos (`kind: "video"`)
  - Continue to use frame classes for rhythm (`aspect-video` for wide clips)
  - Use `object-contain` so preview posters and video frames are not cropped
  - Preserve click-to-play muted behavior

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
- `interaction` (`heroAutoplayMuted`, `tapToPlayLoopMuted`, `staticImage`)

Notes:
- `title` and `description` are required metadata fields.
- Category/title/description overlays are rendered on tile hover.

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
   - hero media: `heroAutoplayMuted`
   - in-grid videos: `tapToPlayLoopMuted`
   - images: `staticImage`
7. Keep video posters distinct from still-image tile sources to avoid visible duplicates.

## QA checklist

- Hero video starts muted and can be toggled mute/unmute.
- In-grid videos stay paused until clicked.
- In-grid videos pause when out of viewport.
- Lightbox opens from any tile.
- Lightbox navigation works:
  - `Esc` closes
  - left/right arrows navigate
  - swipe works on touch devices
- Still images are fully visible at all breakpoints (`sm`, `md`, `lg`, `xl`) with no crop-off of key content.
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
