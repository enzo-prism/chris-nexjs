import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { decodeHTML } from "entities";
import ts from "typescript";

import { styleHides } from "./sms-html-guard";

import { officeInfo } from "../shared/officeInfo";
import { CANONICAL_HOST } from "../shared/robots";
import {
  SMS_BRAND_NAME,
  SMS_PRIVACY_NO_MARKETING_SHARE,
  SMS_PRIVACY_PATH,
  SMS_PRIVACY_SHARING_CATEGORIES,
  SMS_PRIVACY_SHARING_CATEGORIES_INTRO,
  SMS_PRIVACY_SHARING_EXCLUSION,
  SMS_PRIVACY_SUBCONTRACTOR_SHARING,
  SMS_TERMS_PATH,
} from "../shared/sms";
import {
  SMS_COPY_EFFECTIVE_DATE_ISO,
  SMS_COPY_EFFECTIVE_DATE_LABEL,
  SMS_FIRST_CONFIRMATION,
  SMS_HELP_AUTO_REPLY,
  SMS_OPT_IN_CHECKBOX,
  SMS_OPT_IN_DEFAULT_CHECKED,
  SMS_PRIVACY_URL,
  SMS_STOP_AUTO_REPLY,
  SMS_TERMS_URL,
} from "../shared/smsStaged";

const STAGED_MODULE = "shared/smsStaged.ts";
const PUBLIC_MODULE = "shared/sms.ts";
const TEST_MODULE = "scripts/sms-copy.test.ts";
const STATIC_SCAN_MODULE = "scripts/sms-staged-static.test.ts";
const HTML_GUARD_MODULE = "scripts/sms-html-guard.ts";

const STAGED_IDENTIFIERS = [
  "SMS_OPT_IN_CHECKBOX",
  "SMS_FIRST_CONFIRMATION",
  "SMS_OPT_IN_DEFAULT_CHECKED",
  "SMS_HELP_AUTO_REPLY",
  "SMS_STOP_AUTO_REPLY",
  "SMS_COPY_EFFECTIVE_DATE_ISO",
  "SMS_COPY_EFFECTIVE_DATE_LABEL",
  "SMS_PRIVACY_URL",
  "SMS_TERMS_URL",
] as const;

const STAGED_STRING_MARKERS = [
  "Yes, text me appointment reminders and a short request to review my visit",
  "Thanks for signing up for visit texts!",
  "You are unsubscribed and will not receive more texts",
  "For help call",
  "Consent isn't required to receive care",
  "Privacy Policy: https://",
  "SMS Terms: https://",
] as const;

const SKIP_DIR_NAMES = new Set([
  ".git",
  ".next",
  ".next-perf",
  "attached_assets",
  "coverage",
  "dist",
  "node_modules",
]);

const SCANNED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".txt",
  ".md",
  ".mdx",
  ".xml",
  ".html",
  ".webmanifest",
  ".svg",
  ".vtt",
  ".htm",
  ".csv",
]);

const DOUBLE_STRING = String.raw`"(?:\\.|[^"\\])*"`;
const SINGLE_STRING = String.raw`'(?:\\.|[^'\\])*'`;
const TICK_STRING = "`(?:\\\\.|[^`\\\\])*`";
const ANY_STRING = `(?:${DOUBLE_STRING}|${SINGLE_STRING}|${TICK_STRING})`;
const CONCAT_RE = new RegExp(`(${ANY_STRING})\\s*\\+\\s*(${ANY_STRING})`, "g");
const ADJACENT_JSX_RE = new RegExp(
  `\\{\\s*(${ANY_STRING})\\s*\\}\\s*\\{\\s*(${ANY_STRING})\\s*\\}`,
  "g",
);
const ARRAY_JOIN_RE = new RegExp(
  `\\[\\s*((?:${ANY_STRING}\\s*,\\s*)+${ANY_STRING})\\s*\\]\\s*\\.\\s*join\\s*\\(\\s*(${ANY_STRING})?\\s*\\)`,
  "g",
);
const ASSIGN_RE = new RegExp(
  `\\b(?:const|let|var)\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*(${ANY_STRING})`,
  "g",
);

function unwrapQuoted(literal: string): string {
  return literal.slice(1, -1);
}

function joinPairedLiterals(source: string, pattern: RegExp, wrapJsx: boolean): string {
  let prev = "";
  let out = source;
  while (out !== prev) {
    prev = out;
    out = out.replace(pattern, (_match, left: string, right: string) => {
      const joined = `"${unwrapQuoted(left)}${unwrapQuoted(right)}"`;
      return wrapJsx ? `{${joined}}` : joined;
    });
  }
  return out;
}

function flattenArrayJoins(source: string): string {
  return source.replace(ARRAY_JOIN_RE, (_match, list: string, sepLit?: string) => {
    const parts: string[] = [];
    const partRe = new RegExp(ANY_STRING, "g");
    let part = partRe.exec(list);
    while (part) {
      parts.push(unwrapQuoted(part[0]));
      part = partRe.exec(list);
    }
    const sep = sepLit ? unwrapQuoted(sepLit) : "";
    return `"${parts.join(sep)}"`;
  });
}

function collectStringAssigns(source: string): Map<string, string> {
  const assigns = new Map<string, string>();
  const assignRe = new RegExp(ASSIGN_RE.source, "g");
  let assigned = assignRe.exec(source);
  while (assigned) {
    assigns.set(assigned[1], unwrapQuoted(assigned[2]));
    assigned = assignRe.exec(source);
  }
  return assigns;
}

function substituteConcatenatedIdentifiers(
  source: string,
  assigns: ReadonlyMap<string, string>,
): string {
  let out = source;
  for (const [name, value] of assigns) {
    const ident = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const right = new RegExp(`\\b${ident}\\b\\s*\\+\\s*(${ANY_STRING})`, "g");
    out = out.replace(right, (_match, lit: string) => `"${value}${unwrapQuoted(lit)}"`);
    const left = new RegExp(`(${ANY_STRING})\\s*\\+\\s*\\b${ident}\\b`, "g");
    out = out.replace(left, (_match, lit: string) => `"${unwrapQuoted(lit)}${value}"`);
  }
  return out;
}

function stripTsComments(inner: string): string {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.JSX, inner);
  let out = "";
  while (true) {
    const kind = scanner.scan();
    if (kind === ts.SyntaxKind.EndOfFileToken) break;
    if (
      kind === ts.SyntaxKind.SingleLineCommentTrivia ||
      kind === ts.SyntaxKind.MultiLineCommentTrivia
    ) {
      continue;
    }
    out += scanner.getTokenText();
  }
  return out;
}

function evalTemplateLiteral(
  node: ts.TemplateExpression | ts.NoSubstitutionTemplateLiteral,
): string | null {
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  let out = node.head.text;
  for (const span of node.templateSpans) {
    const expr = span.expression;
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
      out += expr.text;
    } else if (ts.isNumericLiteral(expr)) {
      out += expr.text;
    } else {
      return null;
    }
    out += span.literal.text;
  }
  return out;
}

function flattenJsxExpression(node: ts.JsxExpression, source: string, sf: ts.SourceFile): string | null {
  const start = node.getStart(sf);
  const end = node.getEnd();
  const inner = source.slice(start + 1, end - 1);
  const stripped = stripTsComments(inner);
  if (node.expression && (ts.isTemplateExpression(node.expression) || ts.isNoSubstitutionTemplateLiteral(node.expression))) {
    const evaluated = evalTemplateLiteral(node.expression);
    if (evaluated !== null) return evaluated;
    return null;
  }
  if (inner !== stripped) {
    return stripped.trim() === "" ? "" : `{${stripped}}`;
  }
  return null;
}

function stripJsxComments(source: string): string {
  const sf = ts.createSourceFile("sms.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const replacements: { start: number; end: number; text: string }[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isJsxExpression(node)) {
      const flattened = flattenJsxExpression(node, source, sf);
      if (flattened !== null) {
        replacements.push({
          start: node.getStart(sf),
          end: node.getEnd(),
          text: flattened,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  let out = source;
  for (const replacement of replacements.sort((a, b) => b.start - a.start)) {
    out = `${out.slice(0, replacement.start)}${replacement.text}${out.slice(replacement.end)}`;
  }
  return out;
}

function flattenJsxMixed(source: string, assigns: ReadonlyMap<string, string>): string {
  const withIdents = source.replace(/\{([A-Za-z_$][\w$]*)\}/g, (match, name: string) => {
    const value = assigns.get(name);
    return value === undefined ? match : value;
  });
  return withIdents.replace(
    /\{\s*(["'`])((?:\\.|[^\\])*?)\1\s*\}/g,
    (_match, _quote: string, inner: string) =>
      inner.replace(/\\u0027/gi, "'").replace(/\\x27/gi, "'").replace(/\\'/g, "'").replace(/\\"/g, '"'),
  );
}

function decodeEntities(source: string): string {
  return decodeHTML(
    source
      .replace(/\\x27/g, "'")
      .replace(/\\u0027/g, "'")
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"'),
  ).replace(/\s+/g, " ");
}

function markupHaystacks(source: string): readonly string[] {
  const noComments = stripJsxComments(source).replace(/<!--[\s\S]*?-->/g, "");
  return [
    decodeEntities(noComments.replace(/<[^>]+>/g, "")).replace(/\s+/g, " "),
    decodeEntities(noComments.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " "),
  ];
}

function normalizeSource(source: string): string {
  const decoded = decodeEntities(stripJsxComments(source))
    .replace(/\\u0027/gi, "'")
    .replace(/\\x27/gi, "'");
  const assigns = collectStringAssigns(decoded);
  const substituted = substituteConcatenatedIdentifiers(decoded, assigns);
  const jsxFlat = flattenJsxMixed(substituted, assigns);
  const joined = joinPairedLiterals(
    flattenArrayJoins(joinPairedLiterals(jsxFlat, CONCAT_RE, false)),
    ADJACENT_JSX_RE,
    true,
  );
  return joined
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, " ");
}

function readWorkspace(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

function walkSourceFiles(dir: string, files: string[]): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) continue;
      walkSourceFiles(fullPath, files);
      continue;
    }
    const ext = entry.name.slice(entry.name.lastIndexOf("."));
    if (!SCANNED_EXTENSIONS.has(ext)) continue;
    if (!statSync(fullPath).isFile()) continue;
    files.push(fullPath);
  }
}

function toPosix(fullPath: string): string {
  return relative(process.cwd(), fullPath).split(sep).join("/");
}

function collectSmsStagedAliases(): readonly string[] {
  const aliases = new Set<string>(["smsStaged"]);
  const scanned: string[] = [];
  walkSourceFiles(process.cwd(), scanned);
  for (const fullPath of scanned) {
    if (!fullPath.endsWith(".json") || !toPosix(fullPath).includes("tsconfig")) continue;
    try {
      const parsed = JSON.parse(readFileSync(fullPath, "utf8")) as {
        compilerOptions?: { paths?: Record<string, readonly string[]> };
      };
      const paths = parsed.compilerOptions?.paths ?? {};
      for (const [alias, targets] of Object.entries(paths)) {
        if (targets.some((target) => target.includes("smsStaged"))) {
          aliases.add(alias.replace(/\/?\*$/, ""));
        }
      }
    } catch {
      // Ignore non-object JSON; the source walk still reads the file as text.
    }
  }
  return [...aliases];
}

function importLooksLikeSmsStaged(source: string, aliases: readonly string[]): boolean {
  const specRe = /(?:import\s*\(|from\s+|require\s*\()\s*["'`]([^"'`]+)["'`]/g;
  let match = specRe.exec(source);
  while (match) {
    const spec = match[1];
    if (aliases.some((alias) => spec === alias || spec.includes(alias))) {
      return true;
    }
    match = specRe.exec(source);
  }
  return /import\s*\*\s+as\s+\w+\s+from\s+["'`][^"'`]+["'`]/.test(source) &&
    aliases.some((alias) => source.includes(alias));
}

const TWILIO_BLOCK_IDS = [
  "SMS_PRIVACY_NO_MARKETING_SHARE",
  "SMS_PRIVACY_SUBCONTRACTOR_SHARING",
  "SMS_PRIVACY_SHARING_EXCLUSION",
] as const;

const TWILIO_ID_RE =
  /\{(SMS_PRIVACY_NO_MARKETING_SHARE|SMS_PRIVACY_SUBCONTRACTOR_SHARING|SMS_PRIVACY_SHARING_EXCLUSION)\}/g;

function extractTsxSection(source: string, id: string): string {
  const start = source.search(new RegExp(`\\bid:\\s*["']${id}["']`));
  assert.ok(start >= 0, `missing TSX section id ${id}`);
  const rest = source.slice(start);
  const matches = [...rest.matchAll(/\bid:\s*["']([A-Za-z0-9-]+)["']/g)];
  if (matches.length < 2 || matches[1].index === undefined) return rest;
  return rest.slice(0, matches[1].index);
}

function assertTwilioSourceSections(relativePath: string, sectionIds: readonly string[]): void {
  const source = stripJsxComments(readWorkspace(relativePath));
  for (const sectionId of sectionIds) {
    const ids = [...extractTsxSection(source, sectionId).matchAll(TWILIO_ID_RE)].map(
      (match) => match[1],
    );
    assert.deepEqual(
      ids,
      [...TWILIO_BLOCK_IDS],
      `${relativePath} #${sectionId} must have exactly no-marketing, then subcontractor, then exclusion`,
    );
  }
}

function assertSourceGuardUnits(): void {
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
      decodeEntities(`For help${entity}call`).includes("For help call"),
      true,
      `decodeEntities must treat ${entity} as a space`,
    );
  }
  assert.equal(
    decodeEntities("Consent isn&amp;#x27;t required").includes("Consent isn't"),
    false,
    "must not double-decode &amp;#x27;",
  );
  const jsx = (inner: string): string =>
    `export default function Page() { return <p>${inner}</p>; }\n`;

  assert.match(
    stripJsxComments(jsx("{// a\n// b\n}Consent isn't required to receive care.")),
    /Consent isn't required to receive care/,
  );
  assert.match(
    stripJsxComments(jsx("{/* a */ /* b */}Consent isn't required to receive care.")),
    /Consent isn't required to receive care/,
  );
  assert.match(
    stripJsxComments(jsx("{/* a */ // b\n}Consent isn't required to receive care.")),
    /Consent isn't required to receive care/,
  );
  assert.match(
    stripJsxComments('const url = {"https://x.com//y"};'),
    /https:\/\/x\.com\/\/y/,
    "JSX comment strip must not eat // inside a string",
  );
  assert.match(
    stripJsxComments(jsx(`Consent isn{/* */ "'"}t required to receive care.`)),
    /Consent isn\{\s*"'"\}t required to receive care/,
  );
  assert.equal(
    normalizeSource(jsx(`Consent isn{/* */ "'"}t required to receive care.`)).includes(
      "Consent isn't required to receive care",
    ),
    true,
    "comment-stripped JSX string literals stay in the haystack",
  );
  assert.equal(
    stripJsxComments(jsx("{/* {SMS_PRIVACY_SHARING_EXCLUSION} */}")).includes(
      "SMS_PRIVACY_SHARING_EXCLUSION",
    ),
    false,
    "JSX comments that contain braces are stripped",
  );
  assert.equal(
    stripJsxComments(jsx("{/* {x} {y: {z}} */}Consent")).includes("{x}"),
    false,
  );
  assert.match(stripJsxComments(jsx("{/* } */}Consent")), /<p>Consent<\/p>/);
  assert.match(stripJsxComments(jsx("{}Consent")), /<p>\{\}Consent<\/p>/);
  assert.equal(
    normalizeSource(jsx("{`Consent isn${\"'\"}t required to receive care.`}")).includes(
      "Consent isn't required to receive care",
    ),
    true,
    "JSX template ${\"'\"} evaluates to an apostrophe",
  );
  assert.equal(
    normalizeSource(jsx("{`Consent isn${/*x*/\"'\"}t required to receive care.`}")).includes(
      "Consent isn't required to receive care",
    ),
    true,
    "JSX template ${/*x*/\"'\"} evaluates after comment strip",
  );
  assert.equal(
    stripJsxComments(jsx("{`Consent isn${foo}t required to receive care.`}")).includes(
      "Consent isn't required to receive care",
    ),
    false,
    "non-constant JSX template interpolations are rejected, not guessed",
  );
}

assertSourceGuardUnits();

const STAGED_ALIASES = collectSmsStagedAliases();

assert.equal(SMS_BRAND_NAME, "Christopher B. Wong, DDS");
assert.equal(SMS_TERMS_PATH, "/sms-terms");
assert.equal(SMS_PRIVACY_PATH, "/privacy-policy");
assert.equal(SMS_PRIVACY_URL, `https://${CANONICAL_HOST}${SMS_PRIVACY_PATH}`);
assert.equal(SMS_TERMS_URL, `https://${CANONICAL_HOST}${SMS_TERMS_PATH}`);
assert.equal(SMS_OPT_IN_DEFAULT_CHECKED, false);
assert.equal(SMS_COPY_EFFECTIVE_DATE_ISO, "PENDING-APPROVAL");
assert.equal(SMS_COPY_EFFECTIVE_DATE_LABEL, "Pending approval");

assert.equal(
  SMS_OPT_IN_CHECKBOX,
  `Yes, text me appointment reminders and a short request to review my visit from ${SMS_BRAND_NAME}. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out or HELP for help. Consent isn't required to receive care. Privacy Policy: ${SMS_PRIVACY_URL}. SMS Terms: ${SMS_TERMS_URL}.`,
);
assert.match(SMS_OPT_IN_CHECKBOX, new RegExp(`Privacy Policy: https://${CANONICAL_HOST}/privacy-policy`));
assert.match(SMS_OPT_IN_CHECKBOX, new RegExp(`SMS Terms: https://${CANONICAL_HOST}/sms-terms`));

assert.equal(
  SMS_FIRST_CONFIRMATION,
  `${SMS_BRAND_NAME}: Thanks for signing up for visit texts! Msg frequency varies. Msg & data rates may apply. Reply HELP for help, STOP to opt out.`,
);

assert.equal(
  SMS_HELP_AUTO_REPLY,
  `${SMS_BRAND_NAME}: For help call ${officeInfo.phone} or email ${officeInfo.email}. Msg & data rates may apply. Reply STOP to opt out.`,
);

assert.equal(
  SMS_STOP_AUTO_REPLY,
  `${SMS_BRAND_NAME}: You are unsubscribed and will not receive more texts. Reply HELP for help.`,
);

assert.equal(
  SMS_PRIVACY_SHARING_CATEGORIES_INTRO,
  "We may share your information only in the following categories:",
);
assert.deepEqual(SMS_PRIVACY_SHARING_CATEGORIES, [
  "With your explicit consent",
  "With insurance companies for claims processing",
  "With other healthcare providers involved in your care",
  "With our business associates who assist in providing services",
  "When required by law or legal process",
  "To protect the rights, property, or safety of our practice or others",
]);
assert.equal(
  SMS_PRIVACY_NO_MARKETING_SHARE,
  "No mobile information will be shared with third parties/affiliates for marketing/promotional purposes.",
);
assert.equal(
  SMS_PRIVACY_SUBCONTRACTOR_SHARING,
  "Information sharing to subcontractors in support services, such as customer service is permitted.",
);
assert.equal(
  SMS_PRIVACY_SHARING_EXCLUSION,
  "All other use case categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.",
);

assert.doesNotMatch(readWorkspace(STAGED_MODULE), /from ["']\.\/sms["']/);
assert.match(readWorkspace(PUBLIC_MODULE), /TODO: Confirm this string against the ReviewFlow or 10DLC brand/);
assert.match(readWorkspace(PUBLIC_MODULE), /Pending Dr\. Wong's approval/);
assert.match(readWorkspace(PUBLIC_MODULE), /Twilio template order: the no-marketing sentence/);
assert.doesNotMatch(readWorkspace(PUBLIC_MODULE), /Wording Dr\. Wong approves/);
assert.match(readWorkspace(STAGED_MODULE), /TODO: Set this ISO date and label when Dr\. Wong approves/);
assert.match(
  readWorkspace(STAGED_MODULE),
  /STOP confirmation text depends on ReviewFlow, the texting provider/,
);
assert.doesNotMatch(
  readWorkspace("client/src/pages/SmsTerms.tsx"),
  /that behavior is unconfirmed/,
);
assert.match(readWorkspace("client/src/pages/SmsTerms.tsx"), /A STOP confirmation text depends on ReviewFlow/);
assert.match(readWorkspace("shared/seo.ts"), /texting terms for \$\{SMS_BRAND_NAME\}/);
assert.match(readWorkspace("client/src/pages/PrivacyPolicy.tsx"), /SMS_PRIVACY_SHARING_EXCLUSION/);
assert.match(readWorkspace("client/src/pages/PrivacyPolicy.tsx"), /SMS_PRIVACY_SUBCONTRACTOR_SHARING/);
assert.match(readWorkspace("client/src/pages/PrivacyPolicy.tsx"), /dateTime="2026-07-15"/);
assert.match(readWorkspace("client/src/pages/SmsTerms.tsx"), /meta=\{null\}/);
assert.doesNotMatch(readWorkspace("client/src/pages/PrivacyPolicy.tsx"), /PENDING-APPROVAL|Pending approval/);
assert.doesNotMatch(readWorkspace("client/src/pages/SmsTerms.tsx"), /PENDING-APPROVAL|Pending approval/);
assert.doesNotMatch(readWorkspace("client/src/components/layout/Footer.tsx"), /@shared\/sms|smsStaged/);
assert.doesNotMatch(readWorkspace("client/src/pages/SmsTerms.tsx"), /SMS_PRIVACY_SHARING_CATEGORIES/);
assert.match(readWorkspace("client/src/pages/PrivacyPolicy.tsx"), /SMS_PRIVACY_SHARING_CATEGORIES_INTRO/);
assert.match(readWorkspace("client/src/pages/PrivacyPolicy.tsx"), /href="#sharing"/);
assert.match(readWorkspace("client/src/pages/SmsTerms.tsx"), /#sharing/);
assertTwilioSourceSections("client/src/pages/PrivacyPolicy.tsx", ["sharing", "text-messaging"]);
assertTwilioSourceSections("client/src/pages/SmsTerms.tsx", ["mobile-numbers"]);

const SOURCE_HIDE_TRICKS = [
  "truncate",
  "line-clamp-1",
  "max-h-6",
  "[filter:opacity(0)]",
  "blur-xl",
  "after:absolute",
  "oklch(",
  "-webkit-text-fill-color",
  "mask-image",
  "text-[0.5px]",
] as const;

const CONSENT_SOURCE_MARKERS = [
  "SMS_PRIVACY_NO_MARKETING_SHARE",
  "SMS_PRIVACY_SUBCONTRACTOR_SHARING",
  "SMS_PRIVACY_SHARING_EXCLUSION",
  "Consent to receive text messages",
  "Message frequency varies",
  "Reply <strong>STOP</strong>",
] as const;

function camelToKebab(name: string): string {
  const kebab = name.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);
  return kebab.startsWith("webkit-") || kebab.startsWith("moz-") ? `-${kebab}` : kebab;
}

function literalCssValue(node: ts.Expression): string | null {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return "true";
  if (node.kind === ts.SyntaxKind.FalseKeyword) return "false";
  return null;
}

function jsxStyleToCss(obj: ts.ObjectLiteralExpression): { css: string; dynamic: boolean } {
  const parts: string[] = [];
  let dynamic = false;
  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) {
      dynamic = true;
      continue;
    }
    const name = ts.isIdentifier(prop.name)
      ? prop.name.text
      : ts.isStringLiteral(prop.name)
        ? prop.name.text
        : null;
    if (!name) {
      dynamic = true;
      continue;
    }
    const value = literalCssValue(prop.initializer);
    if (value === null) {
      dynamic = true;
      continue;
    }
    parts.push(`${camelToKebab(name)}:${value}`);
  }
  return { css: parts.join(";"), dynamic };
}

function sourceHasConsentMarker(text: string): boolean {
  return CONSENT_SOURCE_MARKERS.some((marker) => text.includes(marker));
}

function assertConsentInlineStyleSafe(
  el: ts.JsxOpeningElement | ts.JsxSelfClosingElement,
  sf: ts.SourceFile,
  relativePath: string,
): void {
  for (const attr of el.attributes.properties) {
    if (!ts.isJsxAttribute(attr) || attr.name.getText(sf) !== "style") continue;
    const init = attr.initializer;
    const where = `${relativePath}:${el.getStart(sf)}`;
    assert.ok(init, `${where} consent style attribute is empty`);
    if (ts.isStringLiteral(init)) {
      assert.equal(styleHides(init.text), false, `${where} string style hides text: ${init.text}`);
      continue;
    }
    assert.ok(ts.isJsxExpression(init), `${where} consent style must be a JSX expression or string`);
    const expr = init.expression;
    assert.ok(expr, `${where} consent style={ } is empty`);
    assert.ok(
      ts.isObjectLiteralExpression(expr),
      `${where} consent style={...} is not a static object`,
    );
    const { css, dynamic } = jsxStyleToCss(expr);
    assert.equal(dynamic, false, `${where} dynamic style object is not statically safe`);
    assert.equal(styleHides(css), false, `${where} inline style hides text: ${css}`);
  }
}

function assertConsentPassagesHaveNoHideTricks(relativePath: string): void {
  const source = readWorkspace(relativePath);
  const tagRe = /<p\b([^>]*)>/g;
  let match = tagRe.exec(source);
  while (match) {
    const attrs = match[1] ?? "";
    const after = source.slice(match.index, match.index + 900);
    const isConsent = sourceHasConsentMarker(after);
    if (isConsent) {
      for (const trick of SOURCE_HIDE_TRICKS) {
        assert.equal(
          attrs.includes(trick),
          false,
          `${relativePath} consent passage must not use ${trick}`,
        );
      }
    }
    match = tagRe.exec(source);
  }

  const sf = ts.createSourceFile(relativePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node: ts.Node, inConsentHost: boolean): void => {
    if (ts.isJsxElement(node)) {
      const tag = node.openingElement.tagName.getText(sf);
      const text = node.getText(sf);
      const host =
        (tag === "p" || tag === "span" || tag === "li") &&
        text.length <= 4000 &&
        sourceHasConsentMarker(text);
      const inspect = inConsentHost || host;
      if (inspect) {
        assertConsentInlineStyleSafe(node.openingElement, sf, relativePath);
      }
      for (const child of node.children) visit(child, inspect);
      return;
    }
    if (ts.isJsxSelfClosingElement(node) && inConsentHost) {
      assertConsentInlineStyleSafe(node, sf, relativePath);
      return;
    }
    ts.forEachChild(node, (child) => visit(child, inConsentHost));
  };
  visit(sf, false);
}

assertConsentPassagesHaveNoHideTricks("client/src/pages/PrivacyPolicy.tsx");
assertConsentPassagesHaveNoHideTricks("client/src/pages/SmsTerms.tsx");

const unusedCopyHits: string[] = [];
const scannedFiles: string[] = [];
walkSourceFiles(process.cwd(), scannedFiles);

for (const fullPath of scannedFiles) {
  const relativePath = toPosix(fullPath);
  const allowedStagedFile =
    relativePath === STAGED_MODULE ||
    relativePath === TEST_MODULE ||
    relativePath === STATIC_SCAN_MODULE ||
    relativePath === HTML_GUARD_MODULE;
  const source = readFileSync(fullPath, "utf8");
  const normalized = normalizeSource(source);

  if (!allowedStagedFile && importLooksLikeSmsStaged(normalized, STAGED_ALIASES)) {
    unusedCopyHits.push(`${relativePath} imports smsStaged`);
  }

  if (relativePath === PUBLIC_MODULE && importLooksLikeSmsStaged(normalized, STAGED_ALIASES)) {
    unusedCopyHits.push(`${relativePath} aliases staged copy into the public SMS module`);
  }

  if (!allowedStagedFile) {
    if (relativePath.includes("tsconfig") && relativePath.endsWith(".json")) {
      for (const alias of STAGED_ALIASES) {
        if (alias !== "smsStaged" && normalized.includes(alias)) {
          unusedCopyHits.push(`${relativePath} aliases smsStaged as ${alias}`);
        }
      }
    }
    for (const identifier of STAGED_IDENTIFIERS) {
      if (normalized.includes(identifier)) {
        unusedCopyHits.push(`${relativePath} uses ${identifier}`);
      }
    }
    const haystacks = [normalized];
    if (/\.(tsx|jsx|html|htm|svg|rsc)$/.test(relativePath)) {
      haystacks.push(...markupHaystacks(source));
    }
    for (const marker of STAGED_STRING_MARKERS) {
      if (haystacks.some((haystack) => haystack.includes(marker))) {
        unusedCopyHits.push(`${relativePath} pastes staged copy ${JSON.stringify(marker)}`);
      }
    }
    if (
      /SMS_[A-Z0-9_]*\$\{|["'`]SMS_[A-Z0-9_]*["'`]\s*\+|\+\s*["'`][A-Z0-9_]*(?:CHECKBOX|CONFIRMATION|AUTO_REPLY|DEFAULT_CHECKED)["'`]|\[["'`]SMS_[A-Z0-9_]+["'`]\]/.test(
        normalized,
      )
    ) {
      unusedCopyHits.push(`${relativePath} looks up staged copy by a built-up name`);
    }
  }
}

assert.equal(
  unusedCopyHits.length,
  0,
  `Staged SMS copy must stay unwired. Hits:\n${unusedCopyHits.join("\n")}`,
);

console.log("sms-copy: brand, staged copy, and unused-by-forms checks passed");
