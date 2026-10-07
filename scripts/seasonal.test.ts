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
  isSeasonInRange,
} from "../shared/seasonal";

// Pacific Daylight Time is UTC-7 throughout October 2026.
const SEP_30_LAST_MINUTE = "2026-10-01T06:59:00Z";
const OCT_1_MIDNIGHT = "2026-10-01T07:00:00Z";
const OCT_31_LAST_MINUTE = "2026-11-01T06:59:00Z";
const NOV_1_MIDNIGHT = "2026-11-01T07:00:00Z";

describe("isSeasonInRange", () => {
  it("follows the practice's Pacific calendar day, not UTC", () => {
    assert.equal(isSeasonInRange(halloween2026, new Date(SEP_30_LAST_MINUTE)), false);
    assert.equal(isSeasonInRange(halloween2026, new Date(OCT_1_MIDNIGHT)), true);
    assert.equal(isSeasonInRange(halloween2026, new Date(OCT_31_LAST_MINUTE)), true);
    assert.equal(isSeasonInRange(halloween2026, new Date(NOV_1_MIDNIGHT)), false);
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

  runInNewContext(buildSeasonScript(halloween2026), {
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
    assert.equal(runScript({ now: SEP_30_LAST_MINUTE }), null);
    assert.equal(runScript({ now: OCT_1_MIDNIGHT }), "halloween");
    assert.equal(runScript({ now: OCT_31_LAST_MINUTE }), "halloween");
    assert.equal(runScript({ now: NOV_1_MIDNIGHT }), null);
  });

  it("previews out of season with ?season=halloween for the rest of the session", () => {
    const session = new Map<string, string>();
    assert.equal(runScript({ now: NOV_1_MIDNIGHT, search: "?season=halloween", session }), "halloween");
    assert.equal(session.get(SEASON_PREVIEW_KEY), "1");
    assert.equal(runScript({ now: NOV_1_MIDNIGHT, session }), "halloween");
  });

  it("opts a browser out with ?season=off and resets with ?season=auto", () => {
    const local = new Map<string, string>();
    assert.equal(runScript({ now: OCT_1_MIDNIGHT, search: "?season=off", local }), null);
    assert.equal(local.get(SEASON_OPT_OUT_KEY), "off");
    assert.equal(runScript({ now: OCT_1_MIDNIGHT, local }), null);
    assert.equal(runScript({ now: OCT_1_MIDNIGHT, search: "?season=auto", local }), "halloween");
    assert.equal(local.has(SEASON_OPT_OUT_KEY), false);
  });

  it("an explicit ?season=off wins over an active preview", () => {
    const session = new Map([[SEASON_PREVIEW_KEY, "1"]]);
    assert.equal(runScript({ now: OCT_1_MIDNIGHT, search: "?season=off", session }), null);
    assert.equal(session.has(SEASON_PREVIEW_KEY), false);
  });

  it("still follows the calendar (and honors ?season=) when storage is blocked", () => {
    assert.equal(runScript({ now: OCT_1_MIDNIGHT, local: "throws", session: "throws" }), "halloween");
    assert.equal(runScript({ now: NOV_1_MIDNIGHT, local: "throws", session: "throws" }), null);
    assert.equal(
      runScript({ now: NOV_1_MIDNIGHT, search: "?season=halloween", local: "throws", session: "throws" }),
      "halloween",
    );
  });

  it("swaps the favicon only while the season is on", () => {
    runScript({ now: OCT_1_MIDNIGHT });
    assert.deepEqual(lastIconHrefs, [halloween2026.icon, halloween2026.icon]);
    runScript({ now: NOV_1_MIDNIGHT });
    assert.deepEqual(lastIconHrefs, ["/favicon/favicon-32x32.png", "/favicon.ico"]);
  });

  it("re-applies the attribute when React resets <html> after a hydration error", () => {
    assert.match(
      buildSeasonScript(halloween2026),
      /MutationObserver\(function\(\)\{if\(d\.getAttribute\(c\.attribute\)!==c\.name\)d\.setAttribute\(c\.attribute,c\.name\)\}\)\.observe\(d,\{attributes:true,attributeFilter:\[c\.attribute\]\}\)/,
    );
  });

  it("escapes markup in the inlined config", () => {
    assert.doesNotMatch(buildSeasonScript(halloween2026), /<\/?script/i);
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

  it("keeps the homepage H1 text unchanged", () => {
    const hero = read("client/src/components/sections/HeroSection.tsx");
    assert.match(hero, /Unhurried, conservative dentistry in\{" "\}\s*<span[^>]*>\s*Palo Alto\s*<SeasonalUnderline \/>/);
  });
});
