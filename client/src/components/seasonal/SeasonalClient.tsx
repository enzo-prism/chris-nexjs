"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  SEASON_ATTRIBUTE,
  activeSeason,
  buildSeasonScript,
  leafFallStorageKey,
  seasonalMotionAllowed,
  seasonIsOn,
} from "@shared/seasonal";

/*
 * Client pieces of the seasonal layer, used on the homepage and the
 * 404 page only (keep them out of shared chrome so other routes' JS budgets
 * stay put). See AGENTS.md "Seasonal layer".
 */

/**
 * 404 fallback: Next serves unmatched URLs as a client-rendered error shell
 * whose <head> never ran the server-rendered season script (React-inserted
 * inline scripts do not execute). Re-run the same script once.
 */
export function SeasonFallback(): null {
  useEffect(() => {
    if (!activeSeason || document.documentElement.hasAttribute(SEASON_ATTRIBUTE)) return;
    const script = document.createElement("script");
    script.text = buildSeasonScript(activeSeason);
    document.head.appendChild(script);
    script.remove();
  }, []);
  return null;
}

/**
 * Marks its box with `data-play` the first time it is mostly on screen, so
 * one-off seasonal CSS animations run where visitors can see them. Never
 * plays out of season, for reduced motion, or for Save-Data visitors.
 */
export function SeasonPlay({
  children,
  className = "",
  ariaHidden = false,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly ariaHidden?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || !seasonIsOn() || !seasonalMotionAllowed()) return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setPlay(true);
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      data-play={play ? "true" : undefined}
      aria-hidden={ariaHidden || undefined}
    >
      {children}
    </div>
  );
}

const FALL_MS = 4_700;

// Three leaves let go of the hero sprig on staggered, slightly different
// paths. Total fall (delay + duration) stays under 5s (WCAG 2.2.2).
const leaves = [
  { size: "2.4rem", fall: "cw-leaf-fall-a", duration: "3.7s", delay: "0s", color: "#E08A2E" },
  { size: "1.9rem", fall: "cw-leaf-fall-b", duration: "3.8s", delay: "0.4s", color: "#C0602A" },
  { size: "1.5rem", fall: "cw-leaf-fall-c", duration: "3.6s", delay: "0.8s", color: "#D9A441" },
] as const;

function Leaf() {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
      <path d="M24 2 27.2 9.2 31 7.4 29.6 17.6 35.6 11.6 37.2 15.4 44 14 41.2 21.2 45 23.4 35.4 31 36.6 35 26 33.6 25.2 34 25.6 45 22.4 45 22.8 34 22 33.6 11.4 35 12.6 31 3 23.4 6.8 21.2 4 14 10.8 15.4 12.4 11.6 18.4 17.6 17 7.4 20.8 9.2Z" />
    </svg>
  );
}

/**
 * Leaves falling from the hero's autumn sprig. Plays once per session, only
 * in season, only when the sprig is on screen, and never for reduced-motion
 * or Save-Data visitors. `className` must place this box over the sprig.
 */
export function FallingLeaves({ className = "" }: { readonly className?: string }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const [falling, setFalling] = useState(false);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || !activeSeason || !seasonIsOn() || !seasonalMotionAllowed()) return;
    if (typeof IntersectionObserver === "undefined") return;

    const key = leafFallStorageKey(activeSeason);
    let session: Storage | null = null;
    try {
      session = window.sessionStorage;
      if (session.getItem(key) === "1") return;
    } catch {
      // Storage is blocked: still fall once for this page view.
    }

    let timer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        try {
          session?.setItem(key, "1");
        } catch {
          // Best effort only.
        }
        setFalling(true);
        timer = window.setTimeout(() => setFalling(false), FALL_MS + 200);
      },
      { threshold: 0.6 },
    );
    observer.observe(layer);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className={`cw-season-only pointer-events-none absolute z-[2] ${className}`}
    >
      {falling
        ? leaves.map((leaf) => (
            <span
              key={leaf.fall}
              className="cw-leaf"
              style={
                {
                  "--size": leaf.size,
                  "--fall": leaf.fall,
                  "--duration": leaf.duration,
                  "--delay": leaf.delay,
                  color: leaf.color,
                } as CSSProperties
              }
            >
              <Leaf />
            </span>
          ))
        : null}
    </div>
  );
}
