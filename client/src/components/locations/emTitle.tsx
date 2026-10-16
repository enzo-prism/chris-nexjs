import type { ReactNode } from "react";

/** "Care for *every age*" → Care for <em>every age</em> (gold italic in headings). */
export function emTitle(text: string): ReactNode {
  const parts = text.split(/\*([^*]+)\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => (i % 2 === 1 ? <em key={i}>{part}</em> : part));
}

/** Plain text of an emTitle string (for aria labels and schema). */
export function plainTitle(text: string): string {
  return text.replace(/\*([^*]+)\*/g, "$1");
}
