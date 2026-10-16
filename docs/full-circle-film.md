# "Full Circle" film on the website

Dr. Wong's motion film about how he found dentistry and took over the
practice from Dr. Kris Hamamoto (who took it over from Dr. Benson Kanemoto).
Two edits are on the site:

| Cut | Length | Aspect | Captions | Default for |
|---|---|---|---|---|
| Full film | 2:14 (134.272 s) | 16:9 | WebVTT track (follows the audio) | tablets and desktops |
| Short | 0:56 (56.267 s) | 9:16 | burned in (VTT track for assistive tech, CC off by default) | phones (≤639 px) |

Where it plays: homepage `#story`, `/about#story`, and `/office-tour` (the
film's watch page — VideoObject schema lives there).

## Files (`public/videos/full-circle/`)

Encoded from the masters (Drive folder "Full Circle — Motion Film (final)",
`1EUB0HfnzrdNBb6sd2Cw3mioNiNrLEkcx`); H.264 High, AAC 128k, `+faststart`,
30 fps, loudness kept at about −14 LUFS.

| File | Size | Notes |
|---|---:|---|
| `full-circle-1080.mp4` / `full-circle-720.mp4` | 27.1 / 11.8 MB | wide film |
| `full-circle-vertical-1080.mp4` / `-720.mp4` | 15.4 / 6.8 MB | short |
| `full-circle-teaser.mp4`, `full-circle-teaser-vertical.mp4` | ~0.8 MB each | silent seamless loops (motion poster) |
| `poster-landscape-{960,1280,1920}.webp`, `-1280/1920.jpg` | | wide poster (composite of 0:00.5 + the 0:07 title) |
| `poster-vertical-{720,1080}.webp`, `-720.jpg` | | real frame |
| `full-circle.en.vtt`, `full-circle-vertical.en.vtt` | | captions |
| `full-circle-sprite.jpg` + `full-circle-storyboard.vtt` (and vertical) | 127 / 58 KB | scrub-preview thumbnails every 2 s, 10 columns |

Masters, alternates (roots and end-card posters), stills, contact sheets, the
transcription method, and a caption-uncertainty list are archived on the
PortableSSD at `01_CLIENTS/Chris Wong DDS/Workspaces/2026-10-16-site-redesign/full-circle/`.

## Player (`client/src/components/video/`)

- `StoryFilm.tsx`: version switcher (Full film / Short), chapter chips, and a
  "Read the transcript" disclosure. First paint is a static `<picture>` poster
  (phones get the vertical cover) so there is no layout shift and only one
  poster downloads; the interactive player mounts after hydration.
- `StoryPlayer.tsx`: custom controls (play/pause, mute, time, current chapter,
  seek slider with buffered bar, chapter ticks, hover thumbnails, CC toggle
  with remembered preference, fullscreen with an iPhone fallback that switches
  the captions track to native rendering), auto-hiding controls, tap to show
  controls and double-tap to seek ±10 s on touch, keyboard shortcuts (Space/K,
  ←/→, J/L, M, C, F, 0–9), Media Session metadata, an end screen with
  "Request a visit / Meet the team / Watch again / other cut", and GA4
  `video_start`, `video_progress` (25/50/75) and `video_complete` events.
- Bandwidth: `preload="none"`; the source is chosen at play time (720p vs
  1080p by rendered width × DPR ≤2, always 720p on Save-Data or 2G/3G); the
  captions track only downloads after play; the silent teaser only loads near
  the viewport and never for reduced motion or Save-Data.
- While a film plays, the phone quick-action bar steps aside
  (`html[data-video-playing]`).

Data: `client/src/data/fullCircleFilm.ts` (sources, posters, chapters,
storyboards) and `client/src/data/fullCircleTranscript.tsx` (keep in sync
with the VTT).

## Facts the film states (keep site copy consistent)

- Dr. Wong found dentistry working for his father's family friends, two
  dentist brothers (not named in the film — don't name them).
- He met Dr. Hamamoto, the previous practice owner, at a study group; she
  offered to sell him the practice because it was a good fit.
- Dr. Hamamoto took the practice over from Dr. Benson Kanemoto.
- "A lot of patients are still around"; "the staff has been the same staff
  that she had."
- The film gives no years. Spellings come from the film's on-screen labels
  ("DR. KANEMOTO", "DR. KRIS HAMAMOTO"); confirm with the office if in doubt.
