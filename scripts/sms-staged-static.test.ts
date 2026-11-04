import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import {
  SMS_PRIVACY_NO_MARKETING_SHARE,
  SMS_PRIVACY_SHARING_EXCLUSION,
  SMS_PRIVACY_SUBCONTRACTOR_SHARING,
} from "../shared/sms";
import {
  SMS_COPY_EFFECTIVE_DATE_ISO,
  SMS_COPY_EFFECTIVE_DATE_LABEL,
  SMS_FIRST_CONFIRMATION,
  SMS_HELP_AUTO_REPLY,
  SMS_OPT_IN_CHECKBOX,
  SMS_STOP_AUTO_REPLY,
} from "../shared/smsStaged";
import {
  ancestorConceals,
  closedDetailsHidesSummaryText,
  countOccurrences,
  decodeRenderable,
  descendantHideSelector,
  elementHidesItself,
  findElementById,
  findSectionById,
  firstElement,
  hiddenScopeText,
  isHidingClass,
  markupHaystacks,
  pageVisibleText,
  parseHtml,
  parseHtmlFragment,
  sectionVisibleText,
  styleHides,
} from "./sms-html-guard";

const skipBuild =
  process.env.SMS_STAGED_SKIP_BUILD === "1" || process.argv.includes("--skip-build");

const STAGED_CONSTANTS = {
  SMS_OPT_IN_CHECKBOX,
  SMS_FIRST_CONFIRMATION,
  SMS_HELP_AUTO_REPLY,
  SMS_STOP_AUTO_REPLY,
  SMS_COPY_EFFECTIVE_DATE_ISO,
  SMS_COPY_EFFECTIVE_DATE_LABEL,
} as const;

/**
 * Bundlers rewrite template literals to `.concat(...)`, so the evaluated
 * constant often never appears contiguously. Search these source fragments
 * plus the raw constant values.
 */
const STAGED_FRAGMENTS = [
  "Yes, text me appointment reminders and a short request to review my visit",
  "Thanks for signing up for visit texts!",
  "You are unsubscribed and will not receive more texts",
  "For help call",
  "Consent isn't required to receive care",
  SMS_COPY_EFFECTIVE_DATE_ISO,
  SMS_COPY_EFFECTIVE_DATE_LABEL,
] as const;

function isSkippedScanDir(fullPath: string): boolean {
  const rel = toPosix(fullPath);
  return (
    rel === ".next/cache" ||
    rel.startsWith(".next/cache/") ||
    rel === ".next/server/route-cache" ||
    rel.startsWith(".next/server/route-cache/")
  );
}
const PUBLIC_TEXT_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".mdx",
  ".xml",
  ".html",
  ".json",
  ".js",
  ".css",
  ".webmanifest",
  ".svg",
  ".vtt",
  ".htm",
  ".csv",
]);

const TWILIO_NO_MARKETING = SMS_PRIVACY_NO_MARKETING_SHARE;
const TWILIO_SUBCONTRACTOR = SMS_PRIVACY_SUBCONTRACTOR_SHARING;
const TWILIO_EXCLUSION = SMS_PRIVACY_SHARING_EXCLUSION;
const TWILIO_RUN = `${TWILIO_NO_MARKETING} ${TWILIO_SUBCONTRACTOR} ${TWILIO_EXCLUSION}`;
const TWILIO_NEEDLES = [TWILIO_NO_MARKETING, TWILIO_SUBCONTRACTOR, TWILIO_EXCLUSION] as const;

function walkFiles(dir: string, files: string[], publicTree: boolean): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (isSkippedScanDir(fullPath)) continue;
      walkFiles(fullPath, files, publicTree);
      continue;
    }
    if (!statSync(fullPath).isFile()) continue;
    if (publicTree) {
      const ext = entry.name.slice(entry.name.lastIndexOf("."));
      if (!PUBLIC_TEXT_EXTENSIONS.has(ext)) continue;
    }
    files.push(fullPath);
  }
}

function toPosix(fullPath: string): string {
  return relative(process.cwd(), fullPath).split(sep).join("/");
}

function fragmentElement(html: string) {
  const el = firstElement(parseHtmlFragment(html));
  assert.ok(el, `expected an element in ${html}`);
  return el;
}

function hiddenNeedleCount(html: string): number {
  const section = findSectionById(html, "sharing");
  assert.ok(section, "unit fixture is missing section #sharing");
  let hits = 0;
  if (ancestorConceals(section) || elementHidesItself(section)) {
    hits += 1;
  }
  for (const scope of hiddenScopeText(section)) {
    for (const needle of TWILIO_NEEDLES) {
      hits += countOccurrences(scope, needle);
    }
  }
  return hits;
}

function assertOneContiguousTwilioRun(label: string, visibleText: string): void {
  assert.equal(
    countOccurrences(visibleText, TWILIO_RUN),
    1,
    `${label} must contain exactly one contiguous no-marketing, then subcontractor, then exclusion run`,
  );
  assert.equal(
    countOccurrences(visibleText, TWILIO_NO_MARKETING),
    1,
    `${label} must contain the no-marketing sentence exactly once`,
  );
  assert.equal(
    countOccurrences(visibleText, TWILIO_SUBCONTRACTOR),
    1,
    `${label} must contain the subcontractor sentence exactly once`,
  );
  assert.equal(
    countOccurrences(visibleText, TWILIO_EXCLUSION),
    1,
    `${label} must contain the exclusion sentence exactly once`,
  );
}

function assertTwilioRunNotHidden(label: string, html: string, id: string): void {
  const section = findSectionById(html, id);
  assert.ok(section, `built HTML is missing section #${id}`);
  assert.equal(ancestorConceals(section), false, `${label} sits under a hidden ancestor`);
  assert.equal(elementHidesItself(section), false, `${label} section is hidden from readers`);
  for (const hidden of hiddenScopeText(section)) {
    assert.equal(
      countOccurrences(hidden, TWILIO_NO_MARKETING) +
        countOccurrences(hidden, TWILIO_SUBCONTRACTOR) +
        countOccurrences(hidden, TWILIO_EXCLUSION),
      0,
      `${label} hides a Twilio sentence from readers`,
    );
  }
}

function assertBuiltTwilioOrder(): void {
  const privacyPath = join(process.cwd(), ".next", "server", "app", "privacy-policy.html");
  const termsPath = join(process.cwd(), ".next", "server", "app", "sms-terms.html");
  assert.ok(existsSync(privacyPath), "sms-staged-static: privacy-policy.html is missing");
  assert.ok(existsSync(termsPath), "sms-staged-static: sms-terms.html is missing");

  const privacyHtml = readFileSync(privacyPath, "utf8");
  const termsHtml = readFileSync(termsPath, "utf8");
  const sharing = findSectionById(privacyHtml, "sharing");
  const textMessaging = findSectionById(privacyHtml, "text-messaging");
  const mobileNumbers = findSectionById(termsHtml, "mobile-numbers");
  assert.ok(sharing, "built HTML is missing section #sharing");
  assert.ok(textMessaging, "built HTML is missing section #text-messaging");
  assert.ok(mobileNumbers, "built HTML is missing section #mobile-numbers");

  assertOneContiguousTwilioRun("Privacy #sharing", sectionVisibleText(sharing));
  assertTwilioRunNotHidden("Privacy #sharing", privacyHtml, "sharing");
  assertOneContiguousTwilioRun("Privacy Text Messaging", sectionVisibleText(textMessaging));
  assertTwilioRunNotHidden("Privacy Text Messaging", privacyHtml, "text-messaging");
  assertOneContiguousTwilioRun("/sms-terms #mobile-numbers", sectionVisibleText(mobileNumbers));
  assertTwilioRunNotHidden("/sms-terms #mobile-numbers", termsHtml, "mobile-numbers");
  assert.equal(
    countOccurrences(pageVisibleText(privacyHtml), TWILIO_RUN),
    2,
    "built /privacy-policy must contain exactly two contiguous Twilio M-S-E runs",
  );
  assert.equal(
    countOccurrences(pageVisibleText(termsHtml), TWILIO_RUN),
    1,
    "built /sms-terms must contain exactly one contiguous Twilio M-S-E run",
  );
  assert.equal(
    closedDetailsHidesSummaryText(parseHtml(privacyHtml)),
    false,
    "real /privacy-policy FAQ/TOC summaries stay visible in a closed details",
  );
  assert.equal(
    closedDetailsHidesSummaryText(parseHtml(termsHtml)),
    false,
    "real /sms-terms FAQ/TOC summaries stay visible in a closed details",
  );
}

function assertHiddenGuardUnits(): void {
  for (const entity of [
    "&#xA0;",
    "&#x00A0;",
    "&#XA0;",
    "&#xa0;",
    "&nbsp;",
    "&nbsp",
    "&NonBreakingSpace;",
  ] as const) {
    assert.equal(
      decodeRenderable(`For help${entity}call`).includes("For help call"),
      true,
      `decodeRenderable must treat ${entity} as a space`,
    );
  }
  assert.equal(decodeRenderable("Consent isn&amp;#x27;t required").includes("Consent isn't"), false);

  assert.equal(isHidingClass("hidden"), true);
  assert.equal(isHidingClass("!hidden"), true);
  assert.equal(isHidingClass("md:!hidden"), true);
  assert.equal(isHidingClass("!md:hidden"), true);
  assert.equal(isHidingClass("data-[state=closed]:hidden"), true);
  assert.equal(isHidingClass("invisible"), true);
  assert.equal(isHidingClass("sr-only"), true);
  assert.equal(isHidingClass("md:hidden"), true);
  assert.equal(isHidingClass("print:hidden"), false);
  assert.equal(isHidingClass("dark:hidden"), false);
  assert.equal(isHidingClass("hover:hidden"), false);
  assert.equal(isHidingClass("group-hover:hidden"), false);
  assert.equal(isHidingClass("peer-focus:hidden"), false);
  assert.equal(isHidingClass("focus:hidden"), false);
  assert.equal(isHidingClass("focus-visible:hidden"), false);
  assert.equal(isHidingClass("motion-reduce:hidden"), false);
  assert.equal(isHidingClass("collapse"), true);
  assert.equal(isHidingClass("group-hover/item:hidden"), false);
  assert.equal(isHidingClass("peer-focus/name:hidden"), false);
  assert.equal(isHidingClass("[&]:hidden"), true);
  assert.equal(isHidingClass("[&_li:last-child]:hidden"), false);
  assert.equal(descendantHideSelector("[&_li:last-child]:hidden"), "li:last-child");
  assert.equal(isHidingClass("motion-safe:hidden"), true);
  assert.equal(isHidingClass("[&]:hidden"), true);
  assert.equal(isHidingClass("[&_p]:hidden"), false);
  assert.equal(descendantHideSelector("[&_p]:hidden"), "p");
  assert.equal(isHidingClass("supports-[display:grid]:hidden"), true);
  assert.equal(isHidingClass("portrait:hidden"), true);
  assert.equal(isHidingClass("landscape:hidden"), true);
  assert.equal(isHidingClass("ltr:hidden"), true);
  assert.equal(isHidingClass("rtl:hidden"), true);
  assert.equal(isHidingClass("*:hidden"), true);
  assert.equal(isHidingClass("overflow-hidden"), false);

  assert.equal(styleHides("DISPLAY:NONE"), true);
  assert.equal(styleHides("display:/**/none"), true);
  assert.equal(styleHides("visibility:hidden"), true);
  assert.equal(styleHides("visibility:collapse"), true);
  assert.equal(styleHides("opacity:0"), true);
  assert.equal(styleHides("opacity:00"), true);
  assert.equal(styleHides("opacity:.0"), true);
  assert.equal(styleHides("opacity:0%"), true);
  assert.equal(styleHides("font-size:0"), true);
  assert.equal(styleHides("content-visibility:hidden"), true);
  assert.equal(styleHides("clip-path:inset(100%)"), true);
  assert.equal(styleHides("color:transparent"), true);
  assert.equal(styleHides("transform:scale(0)"), true);
  assert.equal(styleHides("max-height:0"), true);
  assert.equal(styleHides("visibility:collapse"), true);
  assert.equal(styleHides("backface-visibility:hidden"), false);
  assert.equal(styleHides("fill-opacity:0"), false);
  assert.equal(styleHides("opacity:0.5"), false);

  assert.equal(elementHidesItself(fragmentElement('<p title="Nothing is hidden here">x</p>')), false);
  assert.equal(elementHidesItself(fragmentElement('<p class="overflow-hidden">x</p>')), false);
  assert.equal(elementHidesItself(fragmentElement("<p hidden>x</p>")), true);
  assert.equal(elementHidesItself(fragmentElement("<p/hidden>x</p>")), true);
  assert.equal(elementHidesItself(fragmentElement('<p class="x"hidden>x</p>')), true);
  assert.equal(elementHidesItself(fragmentElement('<p class="!hidden">x</p>')), true);
  assert.equal(elementHidesItself(fragmentElement('<p class="md:!hidden">x</p>')), true);
  assert.equal(
    elementHidesItself(fragmentElement('<p class="data-[state=closed]:hidden">x</p>')),
    true,
  );
  assert.equal(elementHidesItself(fragmentElement('<p class="print:hidden">x</p>')), false);
  assert.equal(elementHidesItself(fragmentElement("<dialog>x</dialog>")), true);
  assert.equal(elementHidesItself(fragmentElement("<dialog open>x</dialog>")), false);
  assert.equal(elementHidesItself(fragmentElement("<details>x</details>")), false);
  assert.equal(elementHidesItself(fragmentElement("<details open>x</details>")), false);

  const summaryTree = parseHtml(
    '<html><body><details><summary id="toc">On this page</summary><p>links</p></details></body></html>',
  );
  const summary = findElementById(summaryTree, "toc");
  assert.ok(summary, "summary fixture");
  assert.equal(ancestorConceals(summary), false, "ancestorConceals(summary) ignores the summary itself");

  assert.equal(
    markupHaystacks("<p>Consent isn&amp;#x27;t required</p>", "page.html").some((haystack) =>
      haystack.includes("Consent isn't"),
    ),
    false,
    "parse5 text is decoded once: &amp;#x27; is not an apostrophe",
  );
  assert.equal(
    markupHaystacks("<p>For&amp;nbsp;help call</p>", "page.html").some((haystack) =>
      haystack.includes("For help call"),
    ),
    false,
    "parse5 text is decoded once: &amp;nbsp; is not a space",
  );
  assert.equal(
    markupHaystacks("<p>For&nbsp;help call</p>", "page.html").some((haystack) =>
      haystack.includes("For help call"),
    ),
    true,
    "a real &nbsp; still becomes a space after one parse5 decode",
  );

  const builtDouble = `<!DOCTYPE html><html><body><section id="sharing"><p>Consent isn&amp;#x27;t required to receive care. For&amp;nbsp;help call</p></section></body></html>`;
  assert.equal(
    pageVisibleText(builtDouble).includes("Consent isn't"),
    false,
    "built HTML decodes &amp;#x27; only once",
  );
  assert.equal(
    pageVisibleText(builtDouble).includes("For help call"),
    false,
    "built HTML decodes &amp;nbsp; only once",
  );
  assert.equal(
    markupHaystacks(builtDouble, ".next/server/app/privacy-policy.html").some((haystack) =>
      haystack.includes("For help call") || haystack.includes("Consent isn't"),
    ),
    false,
    "built-HTML haystacks do not double-decode",
  );

  const run = TWILIO_NO_MARKETING;
  const shell = (inner: string): string =>
    `<html><body><section id="sharing">${inner}</section></body></html>`;

  assert.equal(
    hiddenNeedleCount(shell(`<p title="Nothing is hidden here">${run}</p>`)),
    0,
    "hidden in an attribute value is not the hidden attribute",
  );
  assert.equal(
    hiddenNeedleCount(shell(`<img aria-hidden="true" alt="" src="x"><p>${run}</p>`)),
    0,
    "void img must not open a hidden scope",
  );
  assert.equal(
    hiddenNeedleCount(shell(`<input hidden><p>${run}</p>`)),
    0,
    "void input must not open a hidden scope",
  );
  assert.equal(
    hiddenNeedleCount(shell(`<!-- </div> --><p>${run}</p>`)),
    0,
    "a closing tag inside a comment is not a real close",
  );
  assert.equal(
    hiddenNeedleCount(shell(`<p title="a>b">${run}</p>`)),
    0,
    "> inside an attribute value must not break the tag",
  );
  assert.equal(
    hiddenNeedleCount(shell(`<details><summary>${run}</summary><p>answer</p></details>`)),
    0,
    "summary (and its descendants) stay visible in a closed details",
  );
  assert.ok(
    hiddenNeedleCount(shell(`<details><summary>On this page</summary><p>${run}</p></details>`)) > 0,
    "non-summary children of a closed details are hidden",
  );
  assert.ok(
    hiddenNeedleCount(shell(`<p class="!hidden">${run}</p>`)) > 0,
    "!hidden must hide",
  );
  assert.ok(
    hiddenNeedleCount(shell(`<p style="display:/**/none">${run}</p>`)) > 0,
    "display:/**/none must hide",
  );
  assert.ok(
    hiddenNeedleCount(shell(`<p style="opacity:00">${run}</p>`)) > 0,
    "opacity:00 must hide",
  );
  assert.ok(
    hiddenNeedleCount(shell(`<p style="opacity:.0">${run}</p>`)) > 0,
    "opacity:.0 must hide",
  );
  assert.ok(
    hiddenNeedleCount(shell(`<p style="font-size:0">${run}</p>`)) > 0,
    "font-size:0 must hide",
  );
  assert.ok(
    hiddenNeedleCount(shell(`<p style="content-visibility:hidden">${run}</p>`)) > 0,
    "content-visibility:hidden must hide",
  );
  assert.equal(
    hiddenNeedleCount(shell(`<p style="backface-visibility:hidden">${run}</p>`)),
    0,
    "backface-visibility:hidden is not visibility",
  );
  assert.equal(
    hiddenNeedleCount(shell(`<p style="fill-opacity:0">${run}</p>`)),
    0,
    "fill-opacity:0 is not opacity",
  );
  assert.equal(
    hiddenNeedleCount(shell(`<p class="print:hidden">${run}</p>`)),
    0,
    "print:hidden is ignored by the static scan",
  );
  assert.ok(
    hiddenNeedleCount(shell(`<p class="motion-safe:hidden">${run}</p>`)) > 0,
    "motion-safe:hidden fails closed",
  );
  assert.ok(
    hiddenNeedleCount(shell(`<p class="[&]:hidden">${run}</p>`)) > 0,
    "arbitrary [&]:hidden fails closed",
  );
  assert.ok(
    hiddenNeedleCount(shell(`<p style="clip-path:inset(100%)">${run}</p>`)) > 0,
    "inline clip-path hides",
  );
  assert.ok(
    hiddenNeedleCount(shell(`<p style="color:transparent">${run}</p>`)) > 0,
    "inline transparent color hides",
  );
  assert.ok(
    hiddenNeedleCount(shell(`<p style="transform:scale(0)">${run}</p>`)) > 0,
    "inline scale(0) hides",
  );
  assert.ok(
    hiddenNeedleCount(shell(`<p style="max-height:0">${run}</p>`)) > 0,
    "inline max-height:0 hides",
  );
  assert.ok(
    hiddenNeedleCount(shell(`<p class="sr-only">${run}</p>`)) > 0,
    "sr-only hides",
  );
  assert.ok(
    hiddenNeedleCount(shell(`<p class="collapse">${run}</p>`)) > 0,
    "collapse hides",
  );
  assert.equal(
    hiddenNeedleCount(
      shell(`<ul class="[&_li:last-child]:hidden"><li><p>${run}</p></li><li>other</li></ul>`),
    ),
    0,
    "[&_li:last-child]:hidden does not hide a first-child run",
  );
  assert.ok(
    hiddenNeedleCount(
      shell(`<ul class="[&_li:last-child]:hidden"><li>other</li><li><p>${run}</p></li></ul>`),
    ) > 0,
    "[&_li:last-child]:hidden hides a last-child run",
  );
  assert.equal(
    closedDetailsHidesSummaryText(
      parseHtml(
        shell(`<details><summary>On this page</summary><p>answer</p></details>`),
      ),
    ),
    false,
    "closed details must not treat the summary as hidden",
  );
  assert.equal(
    hiddenNeedleCount(
      `<html><body><details class="lg:hidden"><summary>On this page</summary><div>Links</div></details><section id="sharing"><p>${run}</p></section></body></html>`,
    ),
    0,
    "LegalPage TOC details is a sibling of the article, not a hidden ancestor of Twilio runs",
  );
}

assertHiddenGuardUnits();

if (!skipBuild) {
  console.log("sms-staged-static: building production bundle");
  execSync("pnpm run build", {
    cwd: process.cwd(),
    stdio: "inherit",
  });
}

assert.ok(
  existsSync(join(process.cwd(), ".next", "static")),
  "sms-staged-static: .next/static is missing; run a production build first",
);
assert.ok(
  existsSync(join(process.cwd(), ".next", "server")),
  "sms-staged-static: .next/server is missing; run a production build first",
);

assertBuiltTwilioOrder();
console.log(
  "sms-staged-static: built HTML has exactly one contiguous Twilio M-S-E run in Privacy #sharing, Privacy Text Messaging, and /sms-terms",
);

console.log("sms-staged-static: constants read from shared/smsStaged.ts");
for (const [name, value] of Object.entries(STAGED_CONSTANTS)) {
  console.log(`- ${name}=${JSON.stringify(value)}`);
}
console.log("sms-staged-static: strings searched");
const searched = [...new Set([...Object.values(STAGED_CONSTANTS), ...STAGED_FRAGMENTS])];
for (const value of searched) {
  console.log(`- ${JSON.stringify(value)}`);
}

const hits: string[] = [];
const files: string[] = [];
walkFiles(join(process.cwd(), ".next", "static"), files, false);
walkFiles(join(process.cwd(), ".next", "server"), files, false);
walkFiles(join(process.cwd(), "public"), files, true);
walkFiles(join(process.cwd(), "client", "public"), files, true);

for (const fullPath of files) {
  const relativePath = toPosix(fullPath);
  const haystacks = markupHaystacks(readFileSync(fullPath, "utf8"), relativePath);
  for (const value of searched) {
    if (haystacks.some((haystack) => haystack.includes(value))) {
      hits.push(`${relativePath} contains ${JSON.stringify(value)}`);
    }
  }
}

assert.ok(
  files.some((fullPath) => toPosix(fullPath) === "public/cache/sms-scan-fixture.txt"),
  "public/cache is scanned; only .next/cache and .next/server/route-cache are skipped",
);

assert.equal(
  hits.length,
  0,
  `Staged SMS copy must not appear in .next/static, .next/server, public/, or client/public/. Hits:\n${hits.join("\n")}`,
);

console.log(
  `sms-staged-static: scanned ${files.length} files under .next/static, .next/server, public/, and client/public/; no staged strings`,
);
