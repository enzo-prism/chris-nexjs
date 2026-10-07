/* ------------------------------------------------------------------ *
 * Seasonal layer: small, optional delight on top of the design system,
 * never a re-theme. See AGENTS.md "Seasonal layer (October)".
 *
 * Pages are prerendered, so the season is decided in the browser by a
 * tiny <head> script (`buildSeasonScript`) that sets
 * <html data-cw-season="halloween"> before first paint. Decorations switch
 * on and off on the practice's local calendar day without a redeploy, and
 * every seasonal style in app/globals.css is keyed off that attribute.
 *
 * This module has no imports so `tsx scripts/seasonal.test.ts` can load it
 * directly.
 * ------------------------------------------------------------------ */

export const SEASON_ATTRIBUTE = "data-cw-season";

/** `?season=halloween` previews, `?season=off` opts out, `?season=auto` resets. */
export const SEASON_QUERY_PARAM = "season";
/** localStorage: "off" keeps decorations off in this browser. */
export const SEASON_OPT_OUT_KEY = "cw-season";
/** sessionStorage: "1" forces the season on for this tab (previews/QA). */
export const SEASON_PREVIEW_KEY = "cw-season-preview";

export type SeasonName = "halloween";

export type SeasonalTheme = {
  readonly id: string;
  readonly name: SeasonName;
  /** Inclusive local calendar days (YYYY-MM-DD) in `timeZone`. */
  readonly startsOn: string;
  readonly endsOn: string;
  readonly timeZone: string;
  /** Seasonal favicon swapped in after hydration. */
  readonly icon: string;
};

export const halloween2026: SeasonalTheme = {
  id: "halloween-2026",
  name: "halloween",
  startsOn: "2026-10-01",
  endsOn: "2026-10-31",
  timeZone: "America/Los_Angeles",
  icon: "/seasonal/halloween-2026/icon.svg",
};

/** The season this build knows about, or null to ship no seasonal script. */
export const activeSeason: SeasonalTheme | null = halloween2026;

/** sessionStorage key: the homepage bat fly-by has played this session. */
export function batFlightStorageKey(theme: SeasonalTheme): string {
  return `cw-season-bats:${theme.id}`;
}

/** YYYY-MM-DD for `now` on the theme's local calendar. */
export function seasonLocalDate(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).format(now);
}

export function isSeasonInRange(theme: SeasonalTheme, now: Date): boolean {
  const today = seasonLocalDate(now, theme.timeZone);
  return today >= theme.startsOn && today <= theme.endsOn;
}

/** Client helper: the season the head script applied, if any. */
export function readActiveSeason(): string | null {
  if (typeof document === "undefined") return null;
  return document.documentElement.getAttribute(SEASON_ATTRIBUTE);
}

/** Client helper: true when the active season is switched on for this page. */
export function seasonIsOn(): boolean {
  return Boolean(activeSeason) && readActiveSeason() === activeSeason?.name;
}

/** Client helper: one-off seasonal motion is allowed for this visitor. */
export function seasonalMotionAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection;
  return !connection?.saveData;
}

/**
 * Inline <head> script. It runs synchronously before first paint, so
 * seasonal art never flashes in or shifts layout, and it fails closed (no
 * attribute) on any error. In season it also swaps the favicon links for the
 * seasonal icon, and keeps doing so with a MutationObserver because Next
 * can re-insert its metadata <link>s after hydration (apple-touch-icon is
 * left alone). It also restores the attribute if React strips it: a
 * hydration mismatch makes React client-render the whole document and reset
 * <html>'s attributes (seen on several routes in October 2026). Doing this
 * here keeps the seasonal layer out of the client
 * JS bundle. Storage access is individually guarded because
 * blocked site data makes even the `localStorage` getter throw.
 */
export function buildSeasonScript(theme: SeasonalTheme): string {
  const config = JSON.stringify({
    attribute: SEASON_ATTRIBUTE,
    name: theme.name,
    startsOn: theme.startsOn,
    endsOn: theme.endsOn,
    timeZone: theme.timeZone,
    param: SEASON_QUERY_PARAM,
    optOutKey: SEASON_OPT_OUT_KEY,
    previewKey: SEASON_PREVIEW_KEY,
    icon: theme.icon,
  }).replace(/</g, "\\u003c");

  return `(function(c){try{
var d=document.documentElement;
function area(n){try{return window[n]||null}catch(e){return null}}
function get(s,k){try{return s?s.getItem(k):null}catch(e){return null}}
function put(s,k,v){try{if(s){if(v===null)s.removeItem(k);else s.setItem(k,v)}}catch(e){}}
var ls=area("localStorage"),ss=area("sessionStorage"),q=null;
try{q=new URLSearchParams(window.location.search).get(c.param)}catch(e){}
if(q==="off"){put(ls,c.optOutKey,"off");put(ss,c.previewKey,null)}
else if(q===c.name){put(ls,c.optOutKey,null);put(ss,c.previewKey,"1")}
else if(q==="auto"){put(ls,c.optOutKey,null);put(ss,c.previewKey,null)}
if(q==="off"||get(ls,c.optOutKey)==="off")return;
var on=q===c.name||get(ss,c.previewKey)==="1";
if(!on){var t=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:c.timeZone}).format(new Date());
on=/^\\d{4}-\\d{2}-\\d{2}$/.test(t)&&t>=c.startsOn&&t<=c.endsOn}
if(!on)return;
d.setAttribute(c.attribute,c.name);
try{new MutationObserver(function(){if(d.getAttribute(c.attribute)!==c.name)d.setAttribute(c.attribute,c.name)}).observe(d,{attributes:true,attributeFilter:[c.attribute]})}catch(e){}
function icons(){var l=document.querySelectorAll('link[rel~="icon"]');for(var i=0;i<l.length;i++){if(l[i].getAttribute("href")!==c.icon){l[i].setAttribute("href",c.icon);l[i].setAttribute("type","image/svg+xml")}}}
icons();try{new MutationObserver(icons).observe(document.head,{childList:true})}catch(e){}
}catch(e){}})(${config});`;
}
