"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
} from "react";
import {
  Captions,
  CaptionsOff,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";

import { trackGAEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import {
  formatClock,
  spokenDuration,
  type StorySource,
  type StoryVideoVersion,
} from "./types";

type StoryPlayerProps = {
  readonly version: StoryVideoVersion;
  /** Shown over the last frame when playback ends (CTA, replay, etc.). */
  readonly endScreen?: ReactNode;
  /** Optional overlay content in the poster state (title, kicker). */
  readonly posterCaption?: ReactNode;
  readonly analyticsContext: string;
  readonly className?: string;
  /** Seek requests from outside (chapter chips). Changes to `nonce` re-seek. */
  readonly seekRequest?: { readonly time: number; readonly nonce: number } | null;
  readonly onTimeChange?: (seconds: number) => void;
  /** Start playback on mount (used when switching versions from the end screen). */
  readonly autoStart?: boolean;
};

type NetworkInformationLike = { saveData?: boolean; effectiveType?: string };
type WebkitVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
};

const CAPTIONS_PREF_KEY = "cw-video-captions";
const HIDE_DELAY_MS = 2600;

function connection(): NetworkInformationLike | undefined {
  return (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
}

function pickSource(sources: readonly StorySource[], el: HTMLElement | null): string {
  const sorted = [...sources].sort((a, b) => a.width - b.width);
  const conn = connection();
  if (conn?.saveData || /(^|-)(slow-2g|2g|3g)$/.test(conn?.effectiveType ?? "")) {
    return sorted[0].src;
  }
  const needed = (el?.clientWidth ?? 960) * Math.min(window.devicePixelRatio || 1, 2);
  return (sorted.find((s) => s.width >= needed * 0.9) ?? sorted[sorted.length - 1]).src;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function StoryPlayer({
  version,
  endScreen,
  posterCaption,
  analyticsContext,
  className,
  seekRequest,
  onTimeChange,
  autoStart = false,
}: StoryPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const teaserRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLTrackElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const bufferRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number>(0);
  const rafRef = useRef<number>(0);
  // The big play button unmounts once playback starts; a keyboard user's focus
  // moves to the Play/Pause control instead of falling back to <body>.
  const playPauseRef = useRef<HTMLButtonElement>(null);
  const focusControlsOnStart = useRef(false);
  const tapRef = useRef<{ t: number; x: number; timer: number }>({ t: 0, x: 0, timer: 0 });
  const milestones = useRef<Set<number>>(new Set());
  const scrubbing = useRef(false);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(!version.burnedInCaptions);
  const [caption, setCaption] = useState("");
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(version.durationSeconds);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [hover, setHover] = useState<{ x: number; t: number } | null>(null);
  const [seekFlash, setSeekFlash] = useState<{ side: "back" | "fwd"; n: number } | null>(null);
  const [teaserSrc, setTeaserSrc] = useState<string | null>(null);

  const titleId = useId();
  const chapters = version.chapters ?? [];

  // ---- Captions preference -------------------------------------------------
  useEffect(() => {
    if (version.burnedInCaptions) return;
    try {
      const stored = window.localStorage.getItem(CAPTIONS_PREF_KEY);
      if (stored === "off") setCaptionsOn(false);
    } catch {
      /* storage unavailable */
    }
  }, [version.burnedInCaptions]);

  // ---- Motion poster: start the silent teaser only near the viewport --------
  useEffect(() => {
    if (!version.teaser || started) return;
    const el = containerRef.current;
    if (!el || prefersReducedMotion() || connection()?.saveData) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        const teaser = teaserRef.current;
        if (visible) {
          setTeaserSrc((current) => current ?? version.teaser ?? null);
          teaser?.play().catch(() => undefined);
        } else {
          teaser?.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started, version.teaser]);

  // ---- Controls auto-hide ----------------------------------------------------
  const pokeControls = useCallback(() => {
    setControlsVisible(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (!scrubbing.current && videoRef.current && !videoRef.current.paused) {
        setControlsVisible(false);
        setHover(null);
      }
    }, HIDE_DELAY_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  // While a film plays, floating chrome (the phone quick-action bar) steps
  // aside so it never covers the player controls (see globals.css).
  useEffect(() => {
    const root = document.documentElement;
    if (playing) root.dataset.videoPlaying = "true";
    else delete root.dataset.videoPlaying;
    return () => {
      delete root.dataset.videoPlaying;
    };
  }, [playing]);

  // ---- Progress painting (rAF while playing, no React re-render per frame) --
  const paint = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const d = video.duration || duration || 1;
    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${Math.min(1, video.currentTime / d)})`;
    }
    if (bufferRef.current && video.buffered.length) {
      const end = video.buffered.end(video.buffered.length - 1);
      bufferRef.current.style.transform = `scaleX(${Math.min(1, end / d)})`;
    }
  }, [duration]);

  useEffect(() => {
    if (!playing) return;
    const loop = () => {
      paint();
      rafRef.current = window.requestAnimationFrame(loop);
    };
    rafRef.current = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, [playing, paint]);

  // ---- Fullscreen state -------------------------------------------------------
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // ---- Captions track wiring ----------------------------------------------------
  const syncTrackMode = useCallback(
    (nativeFullscreen = false) => {
      const track = trackRef.current?.track;
      if (!track) return;
      if (nativeFullscreen) {
        track.mode = captionsOn ? "showing" : "disabled";
      } else {
        // "hidden" keeps cues flowing to our custom renderer.
        track.mode = "hidden";
      }
    },
    [captionsOn],
  );

  useEffect(() => {
    const trackEl = trackRef.current;
    // Captions download only once someone presses play.
    if (!trackEl || !started) return;
    const track = trackEl.track;
    track.mode = "hidden";
    const onCue = () => {
      const cues = track.activeCues;
      const text =
        cues && cues.length
          ? Array.from(cues)
              .map((cue) => (cue as VTTCue).text)
              .join("\n")
          : "";
      setCaption(text.replace(/<[^>]+>/g, ""));
    };
    track.addEventListener("cuechange", onCue);
    return () => track.removeEventListener("cuechange", onCue);
  }, [version.captions, started]);

  useEffect(() => {
    const video = videoRef.current as WebkitVideo | null;
    if (!video) return;
    const onBegin = () => syncTrackMode(true);
    const onEnd = () => syncTrackMode(false);
    video.addEventListener("webkitbeginfullscreen", onBegin);
    video.addEventListener("webkitendfullscreen", onEnd);
    return () => {
      video.removeEventListener("webkitbeginfullscreen", onBegin);
      video.removeEventListener("webkitendfullscreen", onEnd);
    };
  }, [syncTrackMode]);

  // ---- External seek (chapter chips) --------------------------------------------
  useEffect(() => {
    if (!seekRequest) return;
    const video = videoRef.current;
    if (!video) return;
    if (!started) {
      start(seekRequest.time);
      return;
    }
    video.currentTime = seekRequest.time;
    if (video.paused) video.play().catch(() => undefined);
    paint();
    pokeControls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekRequest?.nonce]);

  useEffect(() => {
    if (autoStart) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Playback actions ------------------------------------------------------------
  const start = (at = 0) => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.currentSrc) {
      video.src = pickSource(version.sources, containerRef.current);
    }
    if (at > 0) video.currentTime = at;
    focusControlsOnStart.current = Boolean(
      containerRef.current?.contains(document.activeElement) &&
        document.activeElement !== containerRef.current,
    );
    setStarted(true);
    setEnded(false);
    setFailed(false);
    // play() stays inside the click gesture so sound is allowed on iOS.
    video.play().catch(() => {
      // Autoplay with sound refused (rare after a tap) — retry muted.
      video.muted = true;
      setMuted(true);
      video.play().catch(() => setFailed(true));
    });
    if ("mediaSession" in navigator && typeof MediaMetadata !== "undefined") {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: version.title,
        artist: "Christopher B. Wong, DDS",
        album: "Palo Alto",
        artwork: [{ src: version.poster, sizes: "1280x720", type: "image/jpeg" }],
      });
    }
    trackGAEvent("video_start", {
      video_title: version.title,
      video_version: version.id,
      cta_context: analyticsContext,
    });
    pokeControls();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!started) {
      start();
      return;
    }
    if (video.paused || video.ended) {
      if (video.ended) {
        video.currentTime = 0;
        milestones.current.clear();
      }
      setEnded(false);
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
    pokeControls();
  };

  const seekBy = (delta: number) => {
    const video = videoRef.current;
    if (!video || !started) return;
    video.currentTime = Math.max(0, Math.min((video.duration || duration) - 0.25, video.currentTime + delta));
    paint();
    setTime(video.currentTime);
    pokeControls();
  };

  const seekTo = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || duration, seconds));
    setTime(video.currentTime);
    paint();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    pokeControls();
  };

  const toggleCaptions = () => {
    setCaptionsOn((on) => {
      const next = !on;
      try {
        window.localStorage.setItem(CAPTIONS_PREF_KEY, next ? "on" : "off");
      } catch {
        /* ignore */
      }
      return next;
    });
    pokeControls();
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    const video = videoRef.current as WebkitVideo | null;
    if (!container || !video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
      return;
    }
    if (container.requestFullscreen && document.fullscreenEnabled) {
      container.requestFullscreen({ navigationUI: "hide" }).catch(() => undefined);
    } else if (video.webkitEnterFullscreen) {
      // iPhone Safari: only the <video> element itself can go fullscreen.
      syncTrackMode(true);
      video.webkitEnterFullscreen();
    }
  };

  // ---- Media element events ----------------------------------------------------------
  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setTime(video.currentTime);
    onTimeChange?.(video.currentTime);
    if (!playing) paint();
    const d = video.duration || duration;
    if (d > 0) {
      const pct = (video.currentTime / d) * 100;
      for (const mark of [25, 50, 75]) {
        if (pct >= mark && !milestones.current.has(mark)) {
          milestones.current.add(mark);
          trackGAEvent("video_progress", {
            video_title: version.title,
            video_version: version.id,
            video_percent: mark,
            cta_context: analyticsContext,
          });
        }
      }
    }
  };

  const onEnded = () => {
    setPlaying(false);
    setEnded(true);
    setControlsVisible(true);
    trackGAEvent("video_complete", {
      video_title: version.title,
      video_version: version.id,
      cta_context: analyticsContext,
    });
  };

  // ---- Scrubber ----------------------------------------------------------------------
  const timeFromPointer = (clientX: number) => {
    const rail = railRef.current;
    if (!rail) return null;
    const rect = rail.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return { ratio, t: ratio * (videoRef.current?.duration || duration), x: ratio * rect.width };
  };

  const onRailPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!started) return;
    scrubbing.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const hit = timeFromPointer(event.clientX);
    if (hit) seekTo(hit.t);
    pokeControls();
  };
  const onRailPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const hit = timeFromPointer(event.clientX);
    if (!hit) return;
    if (event.pointerType === "mouse" || scrubbing.current) setHover({ x: hit.x, t: hit.t });
    if (scrubbing.current) seekTo(hit.t);
  };
  const onRailPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    scrubbing.current = false;
    if (event.pointerType !== "mouse") setHover(null);
    pokeControls();
  };

  const onRailKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowLeft: -5,
      ArrowRight: 5,
      ArrowDown: -5,
      ArrowUp: 5,
      PageDown: -15,
      PageUp: 15,
    };
    if (event.key in keys) {
      event.preventDefault();
      event.stopPropagation();
      seekBy(keys[event.key]);
    } else if (event.key === "Home") {
      event.preventDefault();
      event.stopPropagation();
      seekTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      event.stopPropagation();
      seekTo((videoRef.current?.duration || duration) - 0.5);
    }
  };

  // ---- Surface gestures: click toggles play (mouse); tap shows controls and
  //      double-tap seeks ±10s (touch). -----------------------------------------
  const onSurfacePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!started || ended) return;
    if (event.pointerType === "mouse") {
      togglePlay();
      return;
    }
    const now = performance.now();
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const tap = tapRef.current;
    if (now - tap.t < 300 && Math.abs(x - tap.x) < 60) {
      window.clearTimeout(tap.timer);
      const side = x < rect.width / 2 ? "back" : "fwd";
      seekBy(side === "back" ? -10 : 10);
      setSeekFlash((prev) => ({ side, n: (prev?.n ?? 0) + 1 }));
      tap.t = 0;
      return;
    }
    tap.t = now;
    tap.x = x;
    tap.timer = window.setTimeout(() => {
      if (controlsVisible && playing) {
        setControlsVisible(false);
      } else {
        pokeControls();
      }
    }, 260);
  };

  // ---- Keyboard shortcuts (focus anywhere inside the player) -------------------
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const onButton = target.tagName === "BUTTON" || target.tagName === "A";
    if (onButton && (event.key === " " || event.key === "Enter")) return;
    const key = event.key.toLowerCase();
    if (key === " " || key === "k") {
      event.preventDefault();
      togglePlay();
    } else if (key === "arrowleft" || key === "j") {
      event.preventDefault();
      seekBy(key === "j" ? -10 : -5);
    } else if (key === "arrowright" || key === "l") {
      event.preventDefault();
      seekBy(key === "l" ? 10 : 5);
    } else if (key === "m") {
      toggleMute();
    } else if (key === "c" && version.captions) {
      toggleCaptions();
    } else if (key === "f") {
      toggleFullscreen();
    } else if (/^[0-9]$/.test(key) && started) {
      seekTo(((videoRef.current?.duration || duration) * Number(key)) / 10);
      pokeControls();
    }
  };

  useEffect(() => {
    if (!started || !focusControlsOnStart.current) return;
    focusControlsOnStart.current = false;
    playPauseRef.current?.focus({ preventScroll: true });
  }, [started]);

  const showChrome = !started || !playing || controlsVisible || ended;
  const activeChapter = [...chapters].reverse().find((c) => time >= c.start - 0.01);
  const hoverChapter = hover ? [...chapters].reverse().find((c) => hover.t >= c.start) : undefined;
  const sb = version.storyboard;
  const sbIndex = sb && hover ? Math.min(sb.count - 1, Math.floor(hover.t / sb.interval)) : 0;
  const railWidth = railRef.current?.clientWidth ?? 1;
  const isPortrait = version.aspect === "9/16";

  return (
    <div
      ref={containerRef}
      role="region"
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
      onPointerMove={started ? pokeControls : undefined}
      className={cn(
        "group/player relative isolate overflow-hidden bg-evergreen-950 text-cream-50 shadow-lift",
        fullscreen ? "rounded-none" : "rounded-[1.75rem] sm:rounded-[2rem]",
        !showChrome && "cursor-none",
        className,
      )}
      style={{ aspectRatio: fullscreen ? undefined : version.aspect.replace("/", " / ") }}
      data-state={ended ? "ended" : playing ? "playing" : started ? "paused" : "idle"}
    >
      <span id={titleId} className="sr-only">
        {version.title} ({spokenDuration(version.durationSeconds)})
      </span>

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        className={cn("absolute inset-0 h-full w-full", isPortrait ? "object-cover" : "object-contain")}
        poster={version.posterWebp ?? version.poster}
        preload="none"
        playsInline
        aria-hidden={!started}
        tabIndex={-1}
        onPlay={() => {
          setPlaying(true);
          setEnded(false);
          pokeControls();
        }}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
          paint();
        }}
        onEnded={onEnded}
        onTimeUpdate={onTimeUpdate}
        onProgress={paint}
        onLoadedMetadata={(event) => {
          const d = event.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
          syncTrackMode(false);
        }}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onError={() => setFailed(true)}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
      >
        {version.captions ? (
          <track
            ref={trackRef}
            kind="captions"
            src={version.captions}
            srcLang="en"
            label="English"
          />
        ) : null}
      </video>

      {/* Gesture surface (above video, below controls). */}
      {started ? (
        <div
          className="absolute inset-0 z-10"
          onPointerUp={onSurfacePointerUp}
          aria-hidden="true"
        />
      ) : null}

      {/* Double-tap seek feedback */}
      {seekFlash ? (
        <div
          key={seekFlash.n}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1/2 z-20 flex h-20 w-20 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-sm font-semibold backdrop-blur-sm [animation:rooted-fade_.25s_ease-out_reverse_.45s_forwards]",
            seekFlash.side === "back" ? "left-[12%]" : "right-[12%]",
          )}
        >
          {seekFlash.side === "back" ? "−10s" : "+10s"}
        </div>
      ) : null}

      {/* Poster state */}
      {!started ? (
        <div className="absolute inset-0 z-20">
          {teaserSrc ? (
            <video
              ref={teaserRef}
              src={teaserSrc}
              muted
              loop
              playsInline
              autoPlay
              preload="none"
              aria-hidden="true"
              tabIndex={-1}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 data-[ready=true]:opacity-100"
              onPlaying={(event) => {
                event.currentTarget.dataset.ready = "true";
              }}
            />
          ) : null}
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(6,26,20,0.55)_100%)]"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => start()}
            className="group/play absolute inset-0 flex flex-col items-center justify-center gap-4 outline-none"
            aria-label={`Play ${version.title}, ${spokenDuration(version.durationSeconds)}`}
          >
            <span className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
              <span
                className="ring-ripple absolute inset-0 rounded-full border border-gold-300/70"
                aria-hidden="true"
              />
              <span
                className="ring-ripple absolute inset-0 rounded-full border border-mint-300/50 [animation-delay:1.6s]"
                aria-hidden="true"
              />
              <span className="relative flex h-full w-full items-center justify-center rounded-full bg-gold-400 text-evergreen-950 shadow-[0_18px_50px_-12px_rgba(224,182,94,0.75)] transition-transform duration-300 group-hover/play:scale-105 group-focus-visible/play:ring-4 group-focus-visible/play:ring-cream-50/80">
                <Play className="ml-1 h-8 w-8 fill-current sm:h-9 sm:w-9" aria-hidden="true" />
              </span>
            </span>
            <span className="rounded-full bg-evergreen-950/55 px-4 py-1.5 text-sm font-semibold tracking-wide text-cream-50 backdrop-blur-md">
              Play · {formatClock(version.durationSeconds)}
            </span>
          </button>
          {posterCaption ? (
            // In a short landscape player on a phone the caption would collide
            // with the centered Play button and its duration pill.
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-7",
                !isPortrait && "hidden sm:block",
              )}
            >
              {posterCaption}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Buffering */}
      {started && waiting && !failed ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center" aria-hidden="true">
          <span className="h-12 w-12 animate-spin rounded-full border-2 border-cream-50/25 border-t-gold-300" />
        </div>
      ) : null}

      {failed ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-evergreen-950/85 p-6 text-center">
          <p className="font-heading text-xl">This video couldn’t play here.</p>
          <a
            href={version.sources[0].src}
            className="btn btn-gold btn-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open the video file
          </a>
        </div>
      ) : null}

      {/* Captions */}
      {started && captionsOn && caption && !ended ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 z-20 flex justify-center px-4 transition-[bottom] duration-300",
            showChrome ? "bottom-[4.75rem] sm:bottom-[5.5rem]" : "bottom-5 sm:bottom-8",
          )}
        >
          <p className="max-w-[min(92%,44rem)] whitespace-pre-line rounded-xl bg-evergreen-950/80 px-3.5 py-2 text-center text-[15px] font-medium leading-snug text-cream-50 shadow-lg backdrop-blur-sm sm:text-lg">
            {caption}
          </p>
        </div>
      ) : null}

      {/* End screen */}
      {ended && endScreen ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-evergreen-950/80 p-5 backdrop-blur-sm [animation:rooted-fade_.5s_ease-out_both]">
          {endScreen}
        </div>
      ) : null}

      {/* Control bar */}
      {started ? (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-40 px-3 pb-3 pt-10 transition-opacity duration-300 sm:px-5 sm:pb-4",
            "bg-gradient-to-t from-evergreen-950/90 via-evergreen-950/45 to-transparent",
            showChrome ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          {/* Scrubber */}
          <div
            ref={railRef}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${formatClock(time)} of ${formatClock(duration)}${activeChapter ? `, ${activeChapter.title}` : ""}`}
            onKeyDown={onRailKeyDown}
            onPointerDown={onRailPointerDown}
            onPointerMove={onRailPointerMove}
            onPointerUp={onRailPointerUp}
            onPointerLeave={() => !scrubbing.current && setHover(null)}
            className="group/rail relative flex h-7 cursor-pointer touch-none items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
          >
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-cream-50/20 transition-[height] group-hover/rail:h-2">
              <div ref={bufferRef} className="absolute inset-0 origin-left scale-x-0 bg-cream-50/25" />
              <div ref={progressRef} className="absolute inset-0 origin-left scale-x-0 bg-gold-400" />
              {chapters.slice(1).map((c) => (
                <span
                  key={c.start}
                  aria-hidden="true"
                  className="absolute top-0 h-full w-[3px] -translate-x-1/2 bg-evergreen-950/70"
                  style={{ left: `${(c.start / (duration || 1)) * 100}%` }}
                />
              ))}
            </div>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-300 shadow-md ring-4 ring-gold-300/25"
              style={{ left: `${(time / (duration || 1)) * 100}%` }}
            />
            {hover ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-8 flex -translate-x-1/2 flex-col items-center gap-1.5"
                style={{
                  left: Math.min(
                    Math.max(hover.x, (sb?.tileWidth ?? 60) / 2 + 4),
                    railWidth - (sb?.tileWidth ?? 60) / 2 - 4,
                  ),
                }}
              >
                {sb ? (
                  <span
                    className="block overflow-hidden rounded-lg border border-cream-50/30 shadow-xl"
                    style={{
                      width: sb.tileWidth,
                      height: sb.tileHeight,
                      backgroundImage: `url(${sb.sprite})`,
                      backgroundPosition: `-${(sbIndex % sb.columns) * sb.tileWidth}px -${Math.floor(sbIndex / sb.columns) * sb.tileHeight}px`,
                    }}
                  />
                ) : null}
                <span className="whitespace-nowrap rounded-md bg-evergreen-950/90 px-2 py-0.5 text-xs font-semibold">
                  {hoverChapter ? `${hoverChapter.title} · ` : ""}
                  {formatClock(hover.t)}
                </span>
              </div>
            ) : null}
          </div>

          <div className="mt-1 flex items-center gap-1 sm:gap-2">
            <PlayerButton
              label={playing ? "Pause" : ended ? "Replay" : "Play"}
              onClick={togglePlay}
              buttonRef={playPauseRef}
            >
              {playing ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : ended ? (
                <RotateCcw className="h-5 w-5" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              )}
            </PlayerButton>
            <PlayerButton label={muted ? "Unmute" : "Mute"} onClick={toggleMute}>
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </PlayerButton>
            <p className="ml-1 text-[13px] font-semibold tabular-nums text-cream-100 sm:text-sm" aria-hidden="true">
              {formatClock(time)} <span className="text-cream-50/50">/ {formatClock(duration)}</span>
            </p>
            {activeChapter && !isPortrait ? (
              <p className="ml-2 hidden min-w-0 truncate text-sm text-cream-100/80 md:block" aria-hidden="true">
                · {activeChapter.title}
              </p>
            ) : null}
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              {version.captions ? (
                <PlayerButton
                  label={captionsOn ? "Turn captions off" : "Turn captions on"}
                  pressed={captionsOn}
                  onClick={toggleCaptions}
                >
                  {captionsOn ? <Captions className="h-5 w-5" /> : <CaptionsOff className="h-5 w-5" />}
                </PlayerButton>
              ) : null}
              <PlayerButton
                label={fullscreen ? "Exit full screen" : "Full screen"}
                onClick={toggleFullscreen}
              >
                {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </PlayerButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PlayerButton({
  label,
  onClick,
  pressed,
  buttonRef,
  children,
}: {
  readonly label: string;
  readonly onClick: () => void;
  readonly pressed?: boolean;
  readonly buttonRef?: Ref<HTMLButtonElement>;
  readonly children: ReactNode;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full text-cream-50 outline-none transition-colors hover:bg-cream-50/15 focus-visible:ring-2 focus-visible:ring-gold-300 aria-pressed:text-gold-300"
    >
      {children}
    </button>
  );
}

export default StoryPlayer;
