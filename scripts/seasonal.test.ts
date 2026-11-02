import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { runInNewContext } from "node:vm";
import {
  SEASON_ATTRIBUTE,
  SEASON_OPT_OUT_KEY,
  SEASON_PREVIEW_KEY,
  activeSeason,
  buildSeasonScript,
  halloween2026,
  thanksgiving2026,
  isSeasonInRange,
} from "../shared/seasonal";

// November 1, 2026 starts on Pacific Daylight Time (UTC-7); clocks fall back
// at 2am, so November 30 ends on Pacific Standard Time (UTC-8).
const BEFORE_LAST_MINUTE = "2026-11-01T06:59:00Z"; // Oct 31, 11:59pm PDT
const START_MIDNIGHT = "2026-11-01T07:00:00Z"; // Nov 1, 12:00am PDT
const END_LAST_MINUTE = "2026-12-01T07:59:00Z"; // Nov 30, 11:59pm PST
const AFTER_MIDNIGHT = "2026-12-01T08:00:00Z"; // Dec 1, 12:00am PST

describe("isSeasonInRange", () => {
  it("follows the practice's Pacific calendar day, not UTC", () => {
    assert.equal(isSeasonInRange(thanksgiving2026, new Date(BEFORE_LAST_MINUTE)), false);
    assert.equal(isSeasonInRange(thanksgiving2026, new Date(START_MIDNIGHT)), true);
    assert.equal(isSeasonInRange(thanksgiving2026, new Date(END_LAST_MINUTE)), true);
    assert.equal(isSeasonInRange(thanksgiving2026, new Date(AFTER_MIDNIGHT)), false);
  });

  it("hands over from Halloween to Thanksgiving at Pacific midnight on November 1", () => {
    assert.equal(activeSeason, thanksgiving2026);
    assert.equal(isSeasonInRange(halloween2026, new Date(BEFORE_LAST_MINUTE)), true);
    assert.equal(isSeasonInRange(halloween2026, new Date(START_MIDNIGHT)), false);
  });
});

type Store = Map<string, string> | "throws";

function storageArea(store: Map<string, string>) {
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  };
}

/** Runs the real inline script against a fake browser. */
function runScript({
  now,
  search = "",
  local = new Map<string, string>(),
  session = new Map<string, string>(),
}: {
  now: string;
  search?: string;
  local?: Store;
  session?: Store;
}) {
  const attributes = new Map<string, string>();
  const iconLinks = [
    fakeLink("/favicon/favicon-32x32.png"),
    fakeLink("/favicon.ico"),
  ];
  const fixed = new Date(now).getTime();
  class FixedDate extends Date {
    constructor(...args: unknown[]) {
      if (args.length === 0) super(fixed);
      else super(...(args as [string]));
    }
  }
  const window: Record<string, unknown> = { location: { search, pathname: "/" } };
  for (const [name, store] of [
    ["localStorage", local],
    ["sessionStorage", session],
  ] as const) {
    Object.defineProperty(window, name, {
      get() {
        if (store === "throws") throw new Error("SecurityError: storage is blocked");
        return storageArea(store);
      },
    });
  }
  const document = {
    head: {},
    documentElement: {
      setAttribute: (name: string, value: string) => void attributes.set(name, value),
    },
    querySelectorAll: (selector: string) => {
      assert.equal(selector, 'link[rel~="icon"]');
      return iconLinks;
    },
  };

  runInNewContext(buildSeasonScript(thanksgiving2026), {
    window,
    document,
    Date: FixedDate,
    Intl,
    URLSearchParams,
  });

  lastIconHrefs = iconLinks.map((link) => link.getAttribute("href"));
  return attributes.get(SEASON_ATTRIBUTE) ?? null;
}

let lastIconHrefs: (string | null)[] = [];

function fakeLink(href: string) {
  const attrs = new Map<string, string>([["href", href]]);
  return {
    getAttribute: (name: string) => attrs.get(name) ?? null,
    setAttribute: (name: string, value: string) => void attrs.set(name, value),
  };
}

describe("buildSeasonScript", () => {
  it("turns the season on only inside the date range", () => {
    assert.equal(runScript({ now: BEFORE_LAST_MINUTE }), null);
    assert.equal(runScript({ now: START_MIDNIGHT }), "thanksgiving");
    assert.equal(runScript({ now: END_LAST_MINUTE }), "thanksgiving");
    assert.equal(runScript({ now: AFTER_MIDNIGHT }), null);
  });

  it("previews out of season with ?season=thanksgiving for the rest of the session", () => {
    const session = new Map<string, string>();
    assert.equal(runScript({ now: AFTER_MIDNIGHT, search: "?season=thanksgiving", session }), "thanksgiving");
    assert.equal(session.get(SEASON_PREVIEW_KEY), "1");
    assert.equal(runScript({ now: AFTER_MIDNIGHT, session }), "thanksgiving");
  });

  it("opts a browser out with ?season=off and resets with ?season=auto", () => {
    const local = new Map<string, string>();
    assert.equal(runScript({ now: START_MIDNIGHT, search: "?season=off", local }), null);
    assert.equal(local.get(SEASON_OPT_OUT_KEY), "off");
    assert.equal(runScript({ now: START_MIDNIGHT, local }), null);
    assert.equal(runScript({ now: START_MIDNIGHT, search: "?season=auto", local }), "thanksgiving");
    assert.equal(local.has(SEASON_OPT_OUT_KEY), false);
  });

  it("an explicit ?season=off wins over an active preview", () => {
    const session = new Map([[SEASON_PREVIEW_KEY, "1"]]);
    assert.equal(runScript({ now: START_MIDNIGHT, search: "?season=off", session }), null);
    assert.equal(session.has(SEASON_PREVIEW_KEY), false);
  });

  it("still follows the calendar (and honors ?season=) when storage is blocked", () => {
    assert.equal(runScript({ now: START_MIDNIGHT, local: "throws", session: "throws" }), "thanksgiving");
    assert.equal(runScript({ now: AFTER_MIDNIGHT, local: "throws", session: "throws" }), null);
    assert.equal(
      runScript({ now: AFTER_MIDNIGHT, search: "?season=thanksgiving", local: "throws", session: "throws" }),
      "thanksgiving",
    );
  });

  it("swaps the favicon only while the season is on", () => {
    runScript({ now: START_MIDNIGHT });
    assert.deepEqual(lastIconHrefs, [thanksgiving2026.icon, thanksgiving2026.icon]);
    runScript({ now: AFTER_MIDNIGHT });
    assert.deepEqual(lastIconHrefs, ["/favicon/favicon-32x32.png", "/favicon.ico"]);
  });

  it("re-applies the attribute when React resets <html> after a hydration error", () => {
    assert.match(
      buildSeasonScript(thanksgiving2026),
      /MutationObserver\(function\(\)\{if\(d\.getAttribute\(c\.attribute\)!==c\.name\)d\.setAttribute\(c\.attribute,c\.name\)\}\)\.observe\(d,\{attributes:true,attributeFilter:\[c\.attribute\]\}\)/,
    );
  });

  it("escapes markup in the inlined config", () => {
    assert.doesNotMatch(buildSeasonScript(thanksgiving2026), /<\/?script/i);
  });
});

describe("seasonal layer boundaries", () => {
  const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

  it("ships the seasonal favicon and every art file the CSS references", () => {
    assert.ok(activeSeason);
    assert.ok(activeSeason.startsOn <= activeSeason.endsOn);
    assert.ok(
      existsSync(join(process.cwd(), "public", activeSeason.icon)),
      `${activeSeason.icon} is missing`,
    );
    const css = read("app/globals.css");
    const urls = [...css.matchAll(/url\("(\/seasonal\/[^"]+)"\)/g)].map((m) => m[1]!);
    assert.ok(urls.length >= 6, "expected seasonal art urls in globals.css");
    for (const url of urls) {
      assert.ok(url.startsWith(`/seasonal/${activeSeason.id}/`), `${url} is not in the active season folder`);
      assert.ok(existsSync(join(process.cwd(), "public", url)), `${url} is missing`);
    }
  });

  it("keeps seasonal components out of the shared footer chunk (route budgets)", () => {
    const footer = read("client/src/components/layout/Footer.tsx");
    assert.doesNotMatch(footer, /components\/seasonal|@shared\/seasonal/);
  });

  it("keeps the homepage H1 (and its seasonal underline) intact", () => {
    const hero = read("client/src/components/home/HomeHero.tsx");
    assert.match(
      hero,
      /Your <em>gentle, unhurried<\/em>\{" "\}\s*<span[^>]*>\s*Palo Alto\s*<SeasonalUnderline \/>\s*<\/span>\{" "\}\s*family dentist/,
    );
  });
});
