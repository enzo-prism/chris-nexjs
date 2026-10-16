"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { CalendarDays, Monitor, Play, RotateCcw, Smartphone, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { StoryPlayer } from "./StoryPlayer";
import { formatClock, type StoryVideoVersion } from "./types";

type StoryFilmProps = {
  /** [wide film, vertical short] — the short is the phone default. */
  readonly film: StoryVideoVersion;
  readonly short?: StoryVideoVersion;
  readonly analyticsContext: string;
  readonly transcript?: ReactNode;
  readonly className?: string;
  /** Place the player in a dark band (switcher/chips restyle). */
  readonly onDark?: boolean;
};

const PHONE_QUERY = "(max-width: 639px)";

/**
 * "Full Circle" film block: a static, CLS-free poster on first paint
 * (one <picture> — phones get the vertical cover, larger screens the wide
 * poster), then the interactive player after hydration.
 */
export function StoryFilm({
  film,
  short,
  analyticsContext,
  transcript,
  className,
  onDark = false,
}: StoryFilmProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [autoStart, setAutoStart] = useState(false);
  const [seek, setSeek] = useState<{ time: number; nonce: number } | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setSelected(short && window.matchMedia(PHONE_QUERY).matches ? short.id : film.id);
  }, [film.id, short]);

  const versions = short ? [film, short] : [film];
  const current = versions.find((v) => v.id === selected) ?? null;

  const choose = (id: string, play = false) => {
    setSeek(null);
    setAutoStart(play);
    setSelected(id);
  };

  const other = current && short ? (current.id === film.id ? short : film) : null;

  const endScreen = (
    <div className="flex max-w-md flex-col items-center gap-4 text-center">
      <p className="font-heading text-2xl font-medium text-cream-50 sm:text-3xl">
        We’d love to <em className="text-gold-300">meet you</em>.
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        <Link href="/schedule#appointment" className="btn btn-gold btn-sm">
          <CalendarDays aria-hidden="true" />
          Request a visit
        </Link>
        <Link href="/about#team" className="btn btn-outline-light btn-sm">
          <Users aria-hidden="true" />
          Meet the team
        </Link>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setSeek({ time: 0, nonce: Date.now() })}
          className="btn btn-sm text-cream-100 hover:bg-white/10"
        >
          <RotateCcw aria-hidden="true" />
          Watch again
        </button>
        {other ? (
          <button
            type="button"
            onClick={() => choose(other.id, true)}
            className="btn btn-sm text-cream-100 hover:bg-white/10"
          >
            <Play aria-hidden="true" />
            {other.id === film.id ? "Watch the full film" : "Watch the short"} ({formatClock(other.durationSeconds)})
          </button>
        ) : null}
      </div>
    </div>
  );

  const chapters = current?.chapters ?? [];
  const activeChapter = [...chapters].reverse().find((c) => now >= c.start - 0.01);

  return (
    <div className={cn("w-full", className)}>
      {short ? (
        <div
          role="radiogroup"
          aria-label="Choose a version"
          className={cn(
            "mx-auto mb-4 flex w-fit items-center gap-1 rounded-full border p-1 text-sm font-semibold",
            onDark ? "border-white/15 bg-white/[0.06]" : "border-cream-300 bg-white",
          )}
        >
          {versions.map((v) => {
            const active = current ? current.id === v.id : false;
            const Icon = v.aspect === "9/16" ? Smartphone : Monitor;
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => choose(v.id)}
                className={cn(
                  "flex min-h-10 items-center gap-2 rounded-full px-4 transition-colors",
                  active
                    ? onDark
                      ? "bg-gold-400 text-evergreen-950"
                      : "bg-evergreen-800 text-cream-50"
                    : onDark
                      ? "text-cream-100 hover:bg-white/10"
                      : "text-ink-soft hover:bg-cream-100",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {v.label}
                <span className="font-normal opacity-75">{formatClock(v.durationSeconds)}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div
        className={cn(
          "mx-auto",
          current?.aspect === "9/16"
            ? "max-w-[24rem]"
            : current
              ? "max-w-5xl"
              : short
                ? "max-w-[24rem] sm:max-w-5xl"
                : "max-w-5xl",
        )}
      >
        {current ? (
          <StoryPlayer
            key={current.id}
            version={current}
            analyticsContext={analyticsContext}
            endScreen={endScreen}
            seekRequest={seek}
            onTimeChange={setNow}
            autoStart={autoStart}
          />
        ) : (
          <StaticPoster film={film} short={short} />
        )}
      </div>

      {chapters.length ? (
        <ol
          aria-label="Chapters"
          className="mx-auto mt-5 flex max-w-5xl snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
        >
          {chapters.map((c, i) => {
            const active = activeChapter?.start === c.start && now > 0;
            return (
              <li key={c.start} className="shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => setSeek({ time: c.start, nonce: Date.now() })}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-2.5 rounded-full border px-4 text-sm transition-colors",
                    onDark
                      ? "border-white/15 text-cream-100 hover:bg-white/10 aria-[current=true]:border-gold-300 aria-[current=true]:text-gold-200"
                      : "border-cream-300 bg-white text-ink-soft hover:border-evergreen-300 aria-[current=true]:border-evergreen-600 aria-[current=true]:text-evergreen-800",
                  )}
                >
                  <span className="font-heading text-base italic opacity-70">{i + 1}</span>
                  <span className="font-semibold">{c.title}</span>
                  <span className="tabular-nums opacity-60">{formatClock(c.start)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}

      {transcript ? (
        <details
          className={cn(
            "faq-item group mx-auto mt-4 max-w-5xl rounded-2xl border",
            onDark ? "border-white/10 bg-white/[0.04]" : "border-cream-300 bg-white",
          )}
        >
          <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 px-5 text-sm font-semibold">
            Read the transcript
            <span className="faq-plus text-xl leading-none" aria-hidden="true">
              +
            </span>
          </summary>
          <div
            className={cn(
              "space-y-4 px-5 pb-6 text-[15px] leading-7",
              onDark ? "text-cream-100/90" : "text-ink-soft",
            )}
          >
            {transcript}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function StaticPoster({
  film,
  short,
}: {
  readonly film: StoryVideoVersion;
  readonly short?: StoryVideoVersion;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] bg-evergreen-950 shadow-lift sm:rounded-[2rem]",
        short ? "aspect-[9/16] sm:aspect-video" : "aspect-video",
      )}
    >
      <picture>
        {short?.posterWebp ? (
          <source media={PHONE_QUERY} srcSet={short.posterWebp} type="image/webp" />
        ) : null}
        {short ? <source media={PHONE_QUERY} srcSet={short.poster} /> : null}
        {film.posterWebp ? <source srcSet={film.posterWebp} type="image/webp" /> : null}
        <img
          src={film.poster}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-400 text-evergreen-950 sm:h-24 sm:w-24">
          <Play className="ml-1 h-8 w-8 fill-current sm:h-9 sm:w-9" />
        </span>
      </div>
    </div>
  );
}

export default StoryFilm;
