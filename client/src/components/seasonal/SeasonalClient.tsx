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
  batFlightStorageKey,
  buildSeasonScript,
  seasonalMotionAllowed,
  seasonIsOn,
} from "@shared/seasonal";

/*
 * Client pieces of the October seasonal layer, used on the homepage and the
 * 404 page only (keep them out of shared chrome so other routes' JS budgets
 * stay put). See AGENTS.md "Seasonal layer (October)".
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

const FLIGHT_MS = 4_700;

// Three bats lift off the moon on staggered, slightly different paths.
// Total flight (delay + duration) stays under 5s (WCAG 2.2.2).
const bats = [
  { size: "3.4rem", flight: "cw-bat-flight-a", duration: "3.6s", delay: "0s" },
  { size: "2.7rem", flight: "cw-bat-flight-b", duration: "3.8s", delay: "0.35s" },
  { size: "2.1rem", flight: "cw-bat-flight-c", duration: "3.6s", delay: "0.75s" },
] as const;

function Bat() {
  return (
    <svg viewBox="0 0 64 30" fill="currentColor" aria-hidden="true">
      <path d="M32 8c1.5 0 2.5 1 3 2.3L36.4 8l.8 3.2C41 7.8 46 6.2 51 6.4c3.4.1 6.6 1 9.4 2.8-2.7.4-4.7 2.2-5.4 4.6-2.1-.9-4.6-.6-6.3.9-1.5-1-3.6-1.1-5.2-.2-1.4.8-2.3 2.2-2.6 3.8-1.6-.9-3.4-1.3-5.3-1.2-1.5.1-2.8.9-3.6 2-.8-1.1-2.1-1.9-3.6-2-1.9-.1-3.7.3-5.3 1.2-.3-1.6-1.2-3-2.6-3.8-1.6-.9-3.7-.8-5.2.2-1.7-1.5-4.2-1.8-6.3-.9-.7-2.4-2.7-4.2-5.4-4.6C6.4 7.4 9.6 6.5 13 6.4c5-.2 10 1.4 13.8 4.8l.8-3.2 1.4 2.3c.5-1.3 1.5-2.3 3-2.3Z" />
    </svg>
  );
}

/**
 * Bats lifting off the hero's harvest moon. Plays once per session, only in
 * season, only when the moon is on screen, and never for reduced-motion or
 * Save-Data visitors. `className` must place this box over the moon.
 */
export function HarvestBats({ className = "" }: { readonly className?: string }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const [flying, setFlying] = useState(false);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || !activeSeason || !seasonIsOn() || !seasonalMotionAllowed()) return;
    if (typeof IntersectionObserver === "undefined") return;

    const key = batFlightStorageKey(activeSeason);
    let session: Storage | null = null;
    try {
      session = window.sessionStorage;
      if (session.getItem(key) === "1") return;
    } catch {
      // Storage is blocked: still fly once for this page view.
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
        setFlying(true);
        timer = window.setTimeout(() => setFlying(false), FLIGHT_MS + 200);
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
      {flying
        ? bats.map((bat) => (
            <span
              key={bat.flight}
              className="cw-bat"
              style={
                {
                  "--size": bat.size,
                  "--flight": bat.flight,
                  "--duration": bat.duration,
                  "--delay": bat.delay,
                } as CSSProperties
              }
            >
              <Bat />
            </span>
          ))
        : null}
    </div>
  );
}
