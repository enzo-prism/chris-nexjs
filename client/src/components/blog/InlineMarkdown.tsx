import type { ReactNode } from "react";
import Link from "next/link";
import { officeInfo } from "@/lib/data";

const LINK_PATTERN = /\[([^\]]+)\]\((\/[^)\s]*|https?:\/\/[^)\s]+)\)/g;
const BOLD_PATTERN = /\*\*([^*]+)\*\*/g;
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Bare office phone numbers and chriswongdds.com URLs in older posts become
// real links (tel: and next/link) instead of dead text.
const AUTOLINK_PATTERN = new RegExp(
  `(${escapeRegExp(officeInfo.phone)})|(?:https?:\\/\\/)?(?:www\\.)?chriswongdds\\.com(\\/[\\w\\-/]*)?`,
  "g",
);

function renderBold(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(BOLD_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    nodes.push(<strong key={`${keyPrefix}-b${index}`}>{match[1]}</strong>);
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderPlain(text: string, keyPrefix: string, linkClassName?: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(AUTOLINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(...renderBold(text.slice(last, index), `${keyPrefix}-${index}`));
    const key = `${keyPrefix}-a${index}`;
    if (match[1]) {
      nodes.push(
        <a key={key} href={`tel:${officeInfo.phoneE164}`} className={linkClassName}>
          {match[0]}
        </a>,
      );
    } else {
      const path = match[2] && match[2] !== "/" ? match[2].replace(/\/$/, "") : "/";
      const href = path === "/schedule" ? "/schedule#appointment" : path;
      nodes.push(
        <Link key={key} href={href} className={linkClassName}>
          {match[0]}
        </Link>,
      );
    }
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(...renderBold(text.slice(last), `${keyPrefix}-${last}`));
  return nodes;
}

/**
 * Renders inline `[label](/path)` links (and `**bold**`) inside a line of
 * copy. Internal paths use next/link; external links open in a new tab.
 * Works in headings too, so "When a [crown](/crowns-palo-alto) is…" renders
 * as a real link instead of raw markdown.
 */
export function renderInlineMarkdown(text: string, linkClassName?: string): ReactNode {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(...renderPlain(text.slice(last, index), `t${index}`, linkClassName));
    const [, label, href] = match;
    const key = `${href}-${index}`;
    nodes.push(
      href.startsWith("/") ? (
        <Link key={key} href={href} className={linkClassName}>
          {label}
        </Link>
      ) : (
        <a key={key} href={href} className={linkClassName} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      ),
    );
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(...renderPlain(text.slice(last), `t${last}`, linkClassName));
  return nodes.length === 1 ? nodes[0] : <>{nodes}</>;
}

/** Plain text of a line with inline markdown removed (for ids, labels). */
export function stripInlineMarkdown(text: string): string {
  return text.replace(LINK_PATTERN, "$1").replace(BOLD_PATTERN, "$1");
}
