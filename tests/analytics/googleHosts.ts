/**
 * Google measurement hosts that tests must stub/block. Production pages
 * on localhost or *.vercel.app must never request these.
 */

const HOST_SUFFIXES = [
  "googletagmanager.com",
  "google-analytics.com",
  "analytics.google.com",
  "googletagservices.com",
  "doubleclick.net",
] as const;

function hostMatchesSuffix(hostname: string, root: string): boolean {
  return hostname === root || hostname.endsWith(`.${root}`);
}

/**
 * google.com/pagead and the same path on Google ccTLDs (google.co.uk,
 * www.google.de, google.com.au, …).
 */
function isGooglePageAdUrl(url: URL): boolean {
  if (!url.pathname.includes("/pagead")) return false;
  const host = url.hostname.toLowerCase();
  if (host === "google.com" || host.endsWith(".google.com")) return true;
  return /^([a-z0-9-]+\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host);
}

export function isBlockedGoogleMeasurementUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  const host = parsed.hostname.toLowerCase();
  if (HOST_SUFFIXES.some((root) => hostMatchesSuffix(host, root))) {
    return true;
  }
  return isGooglePageAdUrl(parsed);
}
