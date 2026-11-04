import { decodeHTML } from "entities";
import { parse, parseFragment, type DefaultTreeAdapterMap } from "parse5";

type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];
type ParentNode = DefaultTreeAdapterMap["parentNode"];
type TextNode = DefaultTreeAdapterMap["textNode"];
type Template = DefaultTreeAdapterMap["template"];

/**
 * Class tokens treated as hiding: hidden / invisible / sr-only (optional
 * leading `!`) with no variants, or with any variant that is not ignored.
 * Ignored only: print, dark, hover, focus* (focus, focus-visible,
 * focus-within), motion-reduce, and group- or peer- interaction variants
 * including named groups (group-hover/item, peer-focus/name).
 * Arbitrary descendant variants such as [&_li:last-child]:hidden hide only
 * the matched descendants. Unknown and self-targeted arbitrary variants
 * fail closed.
 */
const HIDING_UTILITIES = new Set(["hidden", "invisible", "sr-only", "collapse"]);
const IGNORED_VARIANT =
  /^(?:print|dark|hover|focus(?:-visible|-within)?|motion-reduce|(?:group|peer)-(?:hover|focus|focus-visible|focus-within|active)(?:\/[\w-]+)?)$/;

export function collapseWs(source: string): string {
  return source.replace(/\s+/g, " ");
}

export function decodeRenderable(source: string): string {
  return collapseWs(
    decodeHTML(
      source
        .replace(/\\x27/g, "'")
        .replace(/\\u0027/g, "'")
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"'),
    ),
  );
}

export function isMarkupPath(relativePath: string): boolean {
  return /\.(html|htm|rsc|svg)$/.test(relativePath);
}

export function splitClassVariants(token: string): {
  readonly variants: readonly string[];
  readonly utility: string;
} {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  for (const char of token) {
    if (char === "[") depth += 1;
    if (char === "]") depth -= 1;
    if (char === ":" && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  parts.push(current);
  const utility = parts.pop() ?? "";
  return { variants: parts, utility };
}

function stripImportant(token: string): string {
  return token.startsWith("!") ? token.slice(1) : token;
}

function variantHides(variant: string): boolean {
  const base = stripImportant(variant);
  if (base === "") return true;
  return !IGNORED_VARIANT.test(base);
}

export type ArbitraryVariantTarget = "self" | "descendants" | "unknown";

export function arbitraryVariantTarget(variant: string): ArbitraryVariantTarget | null {
  const base = stripImportant(variant);
  if (!base.startsWith("[") || !base.endsWith("]")) return null;
  const inner = base.slice(1, -1);
  if (inner === "&") return "self";
  if (inner.startsWith("&_") || inner.startsWith("& ")) return "descendants";
  return "unknown";
}

export function descendantHideSelector(token: string): string | null {
  const { variants, utility } = splitClassVariants(token);
  const base = stripImportant(utility);
  if (!HIDING_UTILITIES.has(base)) return null;
  for (const variant of variants) {
    if (arbitraryVariantTarget(variant) !== "descendants") continue;
    const inner = stripImportant(variant).slice(1, -1);
    return inner.startsWith("&_") ? inner.slice(2) : inner.slice(2);
  }
  return null;
}

export function isHidingClass(token: string): boolean {
  const { variants, utility } = splitClassVariants(token);
  const base = stripImportant(utility);
  if (!HIDING_UTILITIES.has(base)) return false;
  const targets = variants
    .map(arbitraryVariantTarget)
    .filter((target): target is ArbitraryVariantTarget => target !== null);
  if (targets.includes("descendants") && !targets.includes("self") && !targets.includes("unknown")) {
    return false;
  }
  return variants.every(variantHides);
}

function parseAlphaChannel(raw: string): number | null {
  if (!raw) return null;
  return raw.endsWith("%") ? parseFloat(raw) / 100 : parseFloat(raw);
}

export function colorAlpha(value: string): number | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === "transparent") return 0;
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 4) {
      const alpha = Number.parseInt(hex[3] ?? "", 16);
      return Number.isFinite(alpha) ? alpha / 15 : null;
    }
    if (hex.length === 8) {
      const alpha = Number.parseInt(hex.slice(6, 8), 16);
      return Number.isFinite(alpha) ? alpha / 255 : null;
    }
    return 1;
  }
  const slash = trimmed.match(/^(?:rgba?|hsla?|oklch|oklab)\([^/]+\/\s*([\d.]+%?)\s*\)$/);
  if (slash) return parseAlphaChannel(slash[1] ?? "");
  const rgbComma = trimmed.match(
    /^rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+(?:\s*,\s*([\d.]+%?))?\s*\)$/,
  );
  if (rgbComma) return rgbComma[1] === undefined ? 1 : parseAlphaChannel(rgbComma[1]);
  const hslComma = trimmed.match(
    /^hsla?\(\s*[\d.]+\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?(?:\s*,\s*([\d.]+%?))?\s*\)$/,
  );
  if (hslComma) {
    if (trimmed.startsWith("hsl(") && !trimmed.startsWith("hsla(") && hslComma[1] === undefined) {
      return 1;
    }
    return hslComma[1] === undefined ? 1 : parseAlphaChannel(hslComma[1]);
  }
  return null;
}

function isZeroLength(value: string): boolean {
  return Number.isFinite(parseFloat(value)) && parseFloat(value) === 0;
}

function overflowClips(value: string | undefined): boolean {
  if (!value) return false;
  const first = value.split(/\s+/)[0] ?? "";
  return first === "hidden" || first === "clip" || first === "scroll" || first === "auto";
}

function clipPathHides(value: string): boolean {
  const trimmed = value.replace(/\s+/g, " ").trim();
  const first = trimmed.split(/\s+/)[0] ?? "";
  if (first === "" || first === "none" || first === "unset" || first === "initial") return false;
  if (/^inset\(\s*(?:0(?:px|%)?\s*){1,4}\)$/.test(trimmed)) return false;
  return true;
}

function isOffscreen(decls: ReadonlyMap<string, string>): boolean {
  const position = decls.get("position") ?? "";
  if (position === "absolute" || position === "fixed") {
    for (const prop of ["left", "right", "top", "bottom"] as const) {
      const raw = decls.get(prop);
      if (!raw) continue;
      const n = parseFloat(raw);
      if (Number.isFinite(n) && n <= -999) return true;
    }
  }
  const transform = decls.get("transform") ?? "";
  if (/translate(?:3d|[xy])?\(\s*-?(?:[5-9]\d{2,}|\d{4,})/.test(transform)) return true;
  return false;
}

function parseStyleDecls(style: string): Map<string, string> {
  const decls = new Map<string, string>();
  const withoutComments = style.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const decl of withoutComments.split(";")) {
    const colon = decl.indexOf(":");
    if (colon < 0) continue;
    const property = decl.slice(0, colon).trim().toLowerCase();
    const rawValue = decl.slice(colon + 1).trim().toLowerCase().replace(/!important/g, "").trim();
    if (property) decls.set(property, rawValue);
  }
  return decls;
}

function paintAlphaHides(value: string): boolean {
  const alpha = colorAlpha(value);
  return value === "transparent" || (alpha !== null && Number.isFinite(alpha) && alpha === 0);
}

export function styleHides(style: string): boolean {
  const decls = parseStyleDecls(style);
  const display = (decls.get("display") ?? "").split(/\s+/)[0] ?? "";
  if (display === "none") return true;
  const visibility = (decls.get("visibility") ?? "").split(/\s+/)[0] ?? "";
  if (visibility === "hidden" || visibility === "collapse") return true;
  for (const prop of ["opacity", "font-size", "max-height", "zoom"] as const) {
    const raw = decls.get(prop);
    if (raw && isZeroLength(raw)) return true;
  }
  if ((decls.get("content-visibility") ?? "").split(/\s+/)[0] === "hidden") return true;
  if (clipPathHides(decls.get("clip-path") ?? "")) return true;
  const clip = (decls.get("clip") ?? "").split(/\s+/)[0] ?? "";
  if (clip !== "" && clip !== "auto" && clip !== "none" && clip !== "unset") return true;
  if (paintAlphaHides(decls.get("color") ?? "")) return true;
  if (paintAlphaHides(decls.get("-webkit-text-fill-color") ?? "")) return true;
  const transform = decls.get("transform") ?? "";
  if (/\bscale(?:3d)?\(\s*0(?:\.0+)?(?:\s*,\s*0(?:\.0+)?){0,2}\s*\)/.test(transform)) return true;
  const height = decls.get("height");
  if (
    height &&
    isZeroLength(height) &&
    (overflowClips(decls.get("overflow")) ||
      overflowClips(decls.get("overflow-x")) ||
      overflowClips(decls.get("overflow-y")))
  ) {
    return true;
  }
  if (isOffscreen(decls)) return true;
  return false;
}

function isElement(node: Node): node is Element {
  return "tagName" in node && "attrs" in node && Array.isArray(node.attrs);
}

function isTemplate(node: Node): node is Template {
  return isElement(node) && node.nodeName === "template" && "content" in node;
}

function isText(node: Node): node is TextNode {
  return node.nodeName === "#text";
}

export function parseHtml(html: string): DefaultTreeAdapterMap["document"] {
  return parse(html);
}

export function parseHtmlFragment(html: string): DefaultTreeAdapterMap["documentFragment"] {
  return parseFragment(html);
}

function childNodesOf(node: Node): readonly Node[] {
  if (isTemplate(node)) return node.content.childNodes;
  if ("childNodes" in node) return node.childNodes;
  return [];
}

export function getAttr(el: Element, name: string): string | undefined {
  return el.attrs.find((attr) => attr.name === name.toLowerCase())?.value;
}

export function hasAttr(el: Element, name: string): boolean {
  return el.attrs.some((attr) => attr.name === name.toLowerCase());
}

export function classTokens(el: Element): readonly string[] {
  const raw = getAttr(el, "class") ?? getAttr(el, "classname") ?? "";
  return raw.split(/\s+/).filter(Boolean);
}

export function elementHidesItself(el: Element): boolean {
  const name = el.tagName.toLowerCase();
  if (name === "noscript" || name === "template") return true;
  if (name === "dialog" && !hasAttr(el, "open")) return true;
  if ((getAttr(el, "aria-hidden") ?? "").toLowerCase() === "true") return true;
  if (hasAttr(el, "hidden") || hasAttr(el, "inert")) return true;
  if (styleHides(getAttr(el, "style") ?? "")) return true;
  return classTokens(el).some(isHidingClass);
}

function isSummaryOf(node: Node, details: Element): boolean {
  return (
    isElement(node) &&
    node.tagName.toLowerCase() === "summary" &&
    node.parentNode === details
  );
}

function isUnderSummaryOf(node: Node, details: Element): boolean {
  let current: ParentNode | Node | null = "parentNode" in node ? node.parentNode : null;
  while (current && current !== details) {
    if (isSummaryOf(current, details)) return true;
    current = "parentNode" in current ? current.parentNode : null;
  }
  return false;
}

function summaryStaysVisible(node: Node, details: Element): boolean {
  return isSummaryOf(node, details) || isUnderSummaryOf(node, details);
}

export function ancestorConceals(el: Element): boolean {
  let parent: ParentNode | null = el.parentNode;
  while (parent) {
    if (isElement(parent)) {
      if (elementHidesItself(parent)) return true;
      if (
        parent.tagName.toLowerCase() === "details" &&
        !hasAttr(parent, "open") &&
        !summaryStaysVisible(el, parent)
      ) {
        return true;
      }
    }
    parent = "parentNode" in parent ? parent.parentNode : null;
  }
  return false;
}

export function collectText(node: Node, tagJoin: string): string {
  if (isText(node)) return node.value;
  if (node.nodeName === "#comment") return "";
  return childNodesOf(node)
    .map((child) => collectText(child, tagJoin))
    .join(tagJoin);
}

/** Parse5 already decoded the tree. Collapse whitespace only — do not decode again. */
export function markupHaystacks(source: string, relativePath: string): readonly string[] {
  if (!isMarkupPath(relativePath)) {
    return [decodeRenderable(source)];
  }
  const tree = parse(source);
  return [collapseWs(collectText(tree, "")), collapseWs(collectText(tree, " "))];
}

export function findElementById(root: Node, id: string): Element | null {
  if (isElement(root) && getAttr(root, "id") === id) return root;
  for (const child of childNodesOf(root)) {
    const found = findElementById(child, id);
    if (found) return found;
  }
  return null;
}

export function firstElement(root: Node): Element | null {
  if (isElement(root)) return root;
  for (const child of childNodesOf(root)) {
    const found = firstElement(child);
    if (found) return found;
  }
  return null;
}

export function findSectionById(html: string, id: string): Element | null {
  const el = findElementById(parse(html), id);
  if (!el || el.tagName.toLowerCase() !== "section") return null;
  return el;
}

function walkElements(node: Node, visit: (el: Element) => void): void {
  if (isElement(node)) visit(node);
  for (const child of childNodesOf(node)) walkElements(child, visit);
}

type SimpleSelector = {
  readonly tag: string | null;
  readonly last: boolean;
  readonly first: boolean;
};

export function parseSimpleSelector(selector: string): SimpleSelector | "fail-closed" {
  const trimmed = selector.trim();
  if (trimmed === "*") return { tag: "*", last: false, first: false };
  const match = trimmed.match(/^([A-Za-z][\w-]*)?(?::(last-child|first-child))?$/);
  if (!match || (!match[1] && !match[2])) return "fail-closed";
  return {
    tag: match[1] ? match[1].toLowerCase() : null,
    last: match[2] === "last-child",
    first: match[2] === "first-child",
  };
}

function elementMatchesSimple(el: Element, selector: SimpleSelector): boolean {
  if (selector.tag && selector.tag !== "*" && el.tagName.toLowerCase() !== selector.tag) {
    return false;
  }
  const parent = el.parentNode;
  if (!parent || !("childNodes" in parent)) {
    return !selector.last && !selector.first;
  }
  const siblings = parent.childNodes.filter(isElement);
  if (selector.last && siblings[siblings.length - 1] !== el) return false;
  if (selector.first && siblings[0] !== el) return false;
  return true;
}

export function findMatchingDescendants(root: Element, selector: string): Element[] | "fail-closed" {
  const parsed = parseSimpleSelector(selector);
  if (parsed === "fail-closed") return "fail-closed";
  const matches: Element[] = [];
  walkElements(root, (el) => {
    if (el === root) return;
    if (elementMatchesSimple(el, parsed)) matches.push(el);
  });
  return matches;
}

function closedDetailsHiddenText(details: Element): string {
  return collapseWs(
    details.childNodes
      .filter((child) => !(isElement(child) && child.tagName.toLowerCase() === "summary"))
      .map((child) => collectText(child, " "))
      .join(" "),
  );
}

export function hiddenScopeText(root: Element): string[] {
  const scopes: string[] = [];
  walkElements(root, (el) => {
    if (elementHidesItself(el)) {
      scopes.push(collapseWs(collectText(el, " ")));
      return;
    }
    for (const token of classTokens(el)) {
      const selector = descendantHideSelector(token);
      if (!selector) continue;
      const matches = findMatchingDescendants(el, selector);
      if (matches === "fail-closed") {
        scopes.push(collapseWs(collectText(el, " ")));
        continue;
      }
      for (const match of matches) {
        scopes.push(collapseWs(collectText(match, " ")));
      }
    }
    if (el.tagName.toLowerCase() === "details" && !hasAttr(el, "open")) {
      scopes.push(closedDetailsHiddenText(el));
    }
  });
  return scopes;
}

/** Closed <details> hide non-summary children only. Summaries stay visible. */
export function closedDetailsHidesSummaryText(root: Node): boolean {
  let hides = false;
  walkElements(root, (el) => {
    if (el.tagName.toLowerCase() !== "details" || hasAttr(el, "open")) return;
    const hidden = closedDetailsHiddenText(el);
    for (const child of el.childNodes) {
      if (!isElement(child) || child.tagName.toLowerCase() !== "summary") continue;
      const summaryText = collapseWs(collectText(child, " "));
      if (summaryText.length > 0 && hidden.includes(summaryText)) {
        hides = true;
      }
    }
  });
  return hides;
}

export function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  let count = 0;
  let from = 0;
  let at = haystack.indexOf(needle, from);
  while (at !== -1) {
    count += 1;
    from = at + needle.length;
    at = haystack.indexOf(needle, from);
  }
  return count;
}

export function sectionVisibleText(section: Element): string {
  return collapseWs(collectText(section, ""));
}

export function pageVisibleText(html: string): string {
  return collapseWs(collectText(parse(html), ""));
}
