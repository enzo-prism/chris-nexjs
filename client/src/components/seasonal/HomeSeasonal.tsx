import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SeasonPlay } from "./SeasonalClient";

/*
 * Homepage pieces of the November (Thanksgiving) seasonal layer. Every piece
 * is hidden by default (`.cw-season-only`) and only revealed by the
 * <html data-cw-season> attribute the head script sets before first paint,
 * so nothing shifts. Art is CSS background SVGs from public/seasonal/<id>/
 * (see app/globals.css) to keep the JS small. See AGENTS.md "Seasonal layer".
 *
 * `.cw-season-only` sets `display` outside Tailwind's layers, so it beats
 * utilities like `hidden lg:block` on the same element. Put breakpoint
 * visibility on an inner wrapper instead.
 */

const SPRIG_BOX =
  "-right-3 -top-9 h-20 w-20 sm:-right-8 sm:-top-12 sm:h-28 sm:w-28 lg:-right-12 lg:-top-14 lg:h-36 lg:w-36";

/** Same box as the sprig, so the client leaves fall from it. */
export const heroSprigBox = SPRIG_BOX;

/**
 * Autumn leaves and acorns tucked behind the top-right corner of the hero
 * photo. Render before the photo frame so the photo paints over it.
 */
export function HeroSprig() {
  return (
    <span
      aria-hidden="true"
      className={`cw-season-only cw-art cw-art-sprig cw-sprig pointer-events-none absolute ${SPRIG_BOX}`}
    />
  );
}

/** A tooth in turkey feathers peeking out from behind the hero photo
 *  (desktop only). Hovering it shows a little note (CSS only). */
export function HeroTurkey() {
  return (
    <div
      aria-hidden="true"
      className="cw-season-only absolute -left-14 bottom-24 z-10 w-24"
    >
      <div className="hidden lg:block">
        <span className="cw-art cw-art-turkey cw-turkey-peek cw-turkey-note w-full" />
      </div>
    </div>
  );
}

/** "Happy Thanksgiving" chip above the hero chips (cream hero). */
export function SeasonalGreeting() {
  return (
    <div className="cw-season-only mb-3">
      <p className="inline-flex items-center gap-2 rounded-full border border-pumpkin-300/60 bg-[#FBEEDC] py-1 pl-1.5 pr-3.5 text-xs font-semibold text-[#7A3410] sm:text-sm">
        <span aria-hidden="true" className="cw-art cw-art-leaf w-5 shrink-0 sm:w-6" />
        Happy Thanksgiving from Cambridge Ave
      </p>
    </div>
  );
}

// A small harvest at the foot of the redwoods in the hero's root band
// (positions follow public/brand/roots-ink.svg's tree bases).
const harvest: readonly { readonly art: string; readonly style: CSSProperties }[] = [
  { art: "cw-art-acorn", style: { left: "calc(50% - 466px)", width: 16, animationDelay: "0.2s" } },
  { art: "cw-art-pumpkin", style: { left: "calc(50% - 304px)", width: 36, animationDelay: "0.5s" } },
  { art: "cw-art-pumpkin", style: { left: "calc(50% - 22px)", width: 28, animationDelay: "0s" } },
  { art: "cw-art-oak", style: { left: "calc(50% + 196px)", width: 18, animationDelay: "0.8s" } },
  { art: "cw-art-pumpkin", style: { left: "calc(50% + 416px)", width: 30, animationDelay: "0.35s" } },
];

/** Pumpkins, an acorn, and a fallen oak leaf along the hero's redwood band. */
export function HarvestRow() {
  return (
    <div aria-hidden="true" className="cw-season-only pointer-events-none absolute inset-x-0 top-[34px] h-12 sm:top-[46px]">
      {harvest.map(({ art, style }, i) => (
        <span key={i} className={`cw-art ${art} cw-harvest absolute bottom-0`} style={style} />
      ))}
    </div>
  );
}

/** A maple leaf that drifts down once it scrolls into view, then rests. */
export function LeafDrift({ className = "" }: { readonly className?: string }) {
  return (
    <SeasonPlay ariaHidden className={`cw-season-only cw-drift-wrap pointer-events-none absolute z-10 ${className}`}>
      <span className="cw-drift pointer-events-auto block">
        <span className="cw-art cw-art-leaf block w-9 sm:w-11" />
      </span>
    </SeasonPlay>
  );
}

/** Hand-drawn harvest underline that draws itself under a word. */
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
const bandLeaves: readonly { readonly art: string; readonly style: CSSProperties }[] = [
  { art: "cw-art-leaf-gold", style: { top: "5%", right: "20%", width: 18, rotate: "-18deg", animationDelay: "0s" } },
  { art: "cw-art-oak", style: { top: "8%", right: "34%", width: 11, rotate: "24deg", animationDelay: "0.9s" } },
  { art: "cw-art-leaf-gold", style: { top: "6%", left: "58%", width: 12, rotate: "32deg", animationDelay: "1.1s" } },
  { art: "cw-art-oak", style: { top: "5%", left: "3%", width: 12, rotate: "-30deg", animationDelay: "0.3s" } },
  { art: "cw-art-leaf-gold", style: { bottom: "5%", right: "3%", width: 16, rotate: "12deg", animationDelay: "0.7s" } },
  { art: "cw-art-acorn", style: { bottom: "4%", left: "46%", width: 9, rotate: "-12deg", animationDelay: "0.2s" } },
  { art: "cw-art-leaf-gold", style: { bottom: "7%", left: "2.5%", width: 12, rotate: "-40deg", animationDelay: "0.5s" } },
];

/** A leaf sprig and a few scattered leaves for the "Ready when you are" band. */
export function CtaBandLeaves() {
  return (
    <SeasonPlay
      className="cw-season-only cw-fall pointer-events-none absolute inset-0"
      ariaHidden
    >
      <span className="cw-art cw-art-sprig cw-band-sprig absolute right-4 top-3 w-10 sm:right-5 sm:top-4 sm:w-14" />
      {bandLeaves.map(({ art, style }, index) => (
        <span key={index} className={`cw-art ${art} cw-band-leaf`} style={style} />
      ))}
    </SeasonPlay>
  );
}

// General, ADA-aligned home-care guidance. Keep it general: no claims about
// Dr. Wong's own advice, products, or outcomes.
const feastTips = [
  {
    title: "Pie with the meal",
    body: "Saliva flows more during a meal, which helps rinse away sugar and acid. Dessert with dinner beats grazing on sweets all afternoon.",
  },
  {
    title: "Water with the tart stuff",
    body: "Cranberry sauce, cider, and wine are acidic. Sipping water alongside them helps rinse your teeth between bites.",
  },
  {
    title: "Floss after the feast",
    body: "Turkey loves the spaces between teeth. Floss and brush with fluoride toothpaste before bed, even when you’re traveling.",
  },
] as const;

/** Homepage seasonal band: three feast-smart tips and a checkup nudge. */
export function FeastTipsSection() {
  return (
    <section aria-labelledby="feast-tips-title" className="cw-season-only bg-cream-100 pb-4 pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SeasonPlay className="cw-table relative overflow-hidden rounded-[2rem] bg-hearth p-6 text-cream-100 shadow-lift sm:p-8 lg:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-pumpkin-500/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-cranberry/30 blur-3xl"
          />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)] lg:items-center lg:gap-12">
            <div>
              <div aria-hidden="true" className="flex items-end gap-1.5">
                <span className="cw-art cw-art-pumpkin cw-hop w-10" />
                <span className="cw-art cw-art-pumpkin cw-hop w-14" style={{ animationDelay: "0.18s" }} />
                <span className="cw-art cw-art-turkey cw-hop w-14" style={{ animationDelay: "0.36s" }} />
              </div>
              <p className="mt-5 text-[0.8125rem] font-semibold uppercase tracking-[0.18em] text-pumpkin-300">
                Happy Thanksgiving
              </p>
              <h2 id="feast-tips-title" className="mt-2 text-balance font-heading text-[1.9rem] font-medium leading-tight text-cream-50 sm:text-[2.3rem]">
                Feast-smart tips for a <em className="text-candle">happy</em> holiday table
              </h2>
              <Link
                href="/dental-cleaning-palo-alto"
                className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-semibold text-candle underline decoration-pumpkin-400/60 underline-offset-4 hover:decoration-candle"
              >
                Book a cleaning before the holidays
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-3">
              {feastTips.map((tip) => (
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
