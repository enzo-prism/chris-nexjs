import { activeSeason, buildSeasonScript } from "@shared/seasonal";

/**
 * Sets <html data-cw-season> before first paint while a season is active
 * (or previewed), and swaps in the seasonal favicon. Render inside the root
 * layout's <head>. See AGENTS.md "Seasonal layer (October)".
 */
export function SeasonScript() {
  if (!activeSeason) return null;
  return (
    <script
      id="cw-season"
      dangerouslySetInnerHTML={{ __html: buildSeasonScript(activeSeason) }}
    />
  );
}
