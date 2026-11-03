/** Read route size columns, including Next's optional ISR lifetime columns. */
export function parseRouteLine(line) {
  const match = line.match(
    /^\s*[┌├└│]\s*[○ƒ●]\s+(\S+)\s+\d+(?:\.\d+)?\s*(?:B|kB|MB)\s+(\d+(?:\.\d+)?)\s*kB(?:\s+\S+\s+\S+)?\s*$/,
  );
  if (!match) return null;

  return {
    route: match[1],
    firstLoadKb: Number.parseFloat(match[2]),
  };
}
