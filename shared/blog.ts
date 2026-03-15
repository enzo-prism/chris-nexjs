export function stripMarkdownToPlainText(content: string): string {
  return content
    .replace(/\r\n?/g, "\n")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toComparableDate(date: string): number {
  const time = Date.parse(date);
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

export function sortItemsByDateDesc<T extends { date: string }>(
  items: readonly T[],
): T[] {
  return [...items].sort((a, b) => {
    const difference = toComparableDate(b.date) - toComparableDate(a.date);
    return difference === 0 ? 0 : difference;
  });
}
