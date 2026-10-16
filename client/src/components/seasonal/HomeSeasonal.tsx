import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SeasonPlay } from "./SeasonalClient";

/*
 * Homepage pieces of the October seasonal layer. Every piece is hidden by
 * default (`.cw-season-only`) and only revealed by the <html data-cw-season>
 * attribute the head script sets before first paint, so nothing shifts.
 * Art is CSS background SVGs from public/seasonal/<id>/ (see app/globals.css)
 * to keep the JS small. See AGENTS.md "Seasonal layer (October)".
 *
 * `.cw-season-only` sets `display` outside Tailwind's layers, so it beats
 * utilities like `hidden lg:block` on the same element. Put breakpoint
 * visibility on an inner wrapper instead.
 */

const MOON_BOX =
  "-right-3 -top-9 h-20 w-20 sm:-right-8 sm:-top-12 sm:h-28 sm:w-28 lg:-right-12 lg:-top-14 lg:h-36 lg:w-36";

/** Same box as the moon, so the client bats lift off its face. */
export const harvestMoonBox = MOON_BOX;

/**
 * Harvest moon rising behind the top-right corner of the hero photo. Render
 * before the photo frame so the photo paints over it.
 */
export function HarvestMoon() {
  return (
    <span
      aria-hidden="true"
      className={`cw-season-only cw-art cw-art-moon cw-moon pointer-events-none absolute ${MOON_BOX}`}
    />
  );
}

/** A ghost-tooth peeking out from behind the hero photo (desktop only).
 *  Hovering it shows a little "Boo!" note (CSS only). */
export function HeroGhost() {
  return (
    <div
      aria-hidden="true"
      className="cw-season-only absolute -left-12 bottom-24 z-10 w-20"
    >
      <div className="hidden lg:block">
        <span className="cw-art cw-art-ghost cw-ghost-peek cw-ghost-boo w-full" />
      </div>
    </div>
  );
}

/** "Happy Halloween" chip above the hero chips (cream hero). */
export function SeasonalGreeting() {
  return (
    <div className="cw-season-only mb-3">
      <p className="inline-flex items-center gap-2 rounded-full border border-pumpkin-300/60 bg-[#FFF1E2] py-1 pl-1.5 pr-3.5 text-xs font-semibold text-[#8A3B0C] sm:text-sm">
        <span aria-hidden="true" className="cw-art cw-art-ghost w-5 shrink-0 sm:w-6" />
        Happy Halloween from Cambridge Ave
      </p>
    </div>
  );
}

// Jack-o'-lanterns sitting at the foot of the redwoods in the hero's root
// band (positions follow public/brand/roots-ink.svg's tree bases).
const lanterns: readonly CSSProperties[] = [
  { left: "calc(50% - 470px)", width: 26, animationDelay: "0.2s" },
  { left: "calc(50% - 300px)", width: 34, animationDelay: "0.6s" },
  { left: "calc(50% - 22px)", width: 30, animationDelay: "0s" },
  { left: "calc(50% + 190px)", width: 36, animationDelay: "0.9s" },
  { left: "calc(50% + 420px)", width: 26, animationDelay: "0.4s" },
];

/** Glowing pumpkin patch along the hero's redwood band. */
export function PumpkinPatch() {
  return (
    <div aria-hidden="true" className="cw-season-only pointer-events-none absolute inset-x-0 top-[34px] h-12 sm:top-[46px]">
      {lanterns.map((style, i) => (
        <span key={i} className="cw-art cw-art-pumpkin cw-lantern absolute bottom-0" style={style} />
      ))}
    </div>
  );
}

/** A friendly spider that drops in on its thread once, then bobs. */
export function SpiderDrop({ className = "" }: { readonly className?: string }) {
  return (
    <SeasonPlay ariaHidden className={`cw-season-only cw-spider-wrap pointer-events-none absolute z-10 ${className}`}>
      <span className="cw-spider pointer-events-auto block">
        <span className="cw-thread" />
        <span className="cw-art cw-art-spider block w-9 sm:w-11" />
      </span>
    </SeasonPlay>
  );
}

/** Hand-drawn candlelight underline that draws itself under a word. */
export function SeasonalUnderline() {
  return (
    <span
      aria-hidden="true"
      className="cw-season-only cw-underline pointer-events-none absolute -bottom-[0.14em] left-0 h-[0.2em] w-full"
    />
  );
}

// Kept to the band's top edge and bottom corners so nothing sits behind the
// CTA buttons (right column) or the headline.
const stars: readonly CSSProperties[] = [
  { top: "5%", right: "20%", width: 14, animationDelay: "0s" },
  { top: "9%", right: "34%", width: 9, animationDelay: "0.9s" },
  { top: "6%", left: "58%", width: 8, animationDelay: "1.1s" },
  { top: "5%", left: "3%", width: 10, animationDelay: "0.3s" },
  { bottom: "5%", right: "3%", width: 12, animationDelay: "0.7s" },
  { bottom: "4%", left: "46%", width: 9, animationDelay: "0.2s" },
  { bottom: "7%", left: "2.5%", width: 8, animationDelay: "0.5s" },
];

/** Crescent moon and a few stars for the "Ready when you are" band. */
export function NightBandSky() {
  return (
    <SeasonPlay
      className="cw-season-only cw-sky pointer-events-none absolute inset-0"
      ariaHidden
    >
      <span className="cw-art cw-art-crescent cw-crescent absolute right-4 top-3 w-8 sm:right-5 sm:top-4 sm:w-11" />
      {stars.map((style, index) => (
        <span key={index} className="cw-art cw-art-star cw-star" style={style} />
      ))}
    </SeasonPlay>
  );
}

// General, ADA-aligned home-care guidance. Keep it general: no claims about
// Dr. Wong's own advice, products, or outcomes.
const treatTips = [
  {
    title: "Treats with meals",
    body: "Saliva flows more during a meal, which helps rinse away sugar and acid. Dessert after dinner beats grazing all evening.",
  },
  {
    title: "Chocolate over sticky",
    body: "Chocolate clears from teeth faster than caramels, taffy, or hard candy that lingers for a long time.",
  },
  {
    title: "Water, then brush",
    body: "A glass of water after candy helps. Brush with fluoride toothpaste before bed and floss, even on Halloween night.",
  },
] as const;

/** Homepage seasonal band: three treat-smart tips and a checkup nudge. */
export function TreatTipsSection() {
  return (
    <section aria-labelledby="treat-tips-title" className="cw-season-only bg-cream-100 pb-4 pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SeasonPlay className="cw-patch relative overflow-hidden rounded-[2rem] bg-night p-6 text-cream-100 shadow-lift sm:p-8 lg:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-pumpkin-500/25 blur-3xl"
          />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)] lg:items-center lg:gap-12">
            <div>
              <div aria-hidden="true" className="flex items-end gap-1.5">
                <span className="cw-art cw-art-pumpkin cw-pumpkin w-10" />
                <span className="cw-art cw-art-pumpkin cw-pumpkin w-14" style={{ animationDelay: "0.18s" }} />
                <span className="cw-art cw-art-ghost cw-pumpkin w-10" style={{ animationDelay: "0.36s" }} />
              </div>
              <p className="mt-5 text-[0.8125rem] font-semibold uppercase tracking-[0.18em] text-pumpkin-300">
                Happy Halloween
              </p>
              <h2 id="treat-tips-title" className="mt-2 text-balance font-heading text-[1.9rem] font-medium leading-tight text-cream-50 sm:text-[2.3rem]">
                Treat-smart tips for a <em className="text-candle">sweet</em> October
              </h2>
              <Link
                href="/dental-cleaning-palo-alto"
                className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-semibold text-candle underline decoration-pumpkin-400/60 underline-offset-4 hover:decoration-candle"
              >
                Due for a post-Halloween cleaning?
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-3">
              {treatTips.map((tip) => (
                <li key={tip.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                  <h3 className="font-semibold text-cream-50">{tip.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-cream-100/80">{tip.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </SeasonPlay>
      </div>
    </section>
  );
}
