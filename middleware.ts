import { NextRequest, NextResponse } from "next/server";
import { getLegacyRedirectPath } from "@shared/redirects";
import { normalizePathname } from "@shared/seo";

const CANONICAL_HOST = "www.chriswongdds.com";
const CANONICAL_HOST_WITHOUT_WWW = "chriswongdds.com";

function stripSearchHash(pathname: string): string {
  return normalizePathname(pathname);
}

function shouldEnforceCanonicalHost(hostname?: string): boolean {
  if (!hostname) return false;
  return hostname === CANONICAL_HOST || hostname === CANONICAL_HOST_WITHOUT_WWW;
}

function isLocalHost(hostname?: string): boolean {
  if (!hostname) return false;
  const normalized = hostname.toLowerCase().split(":")[0];
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1"
  );
}

function buildCanonicalUrl(req: NextRequest): URL {
  const url = new URL(req.url);
  url.protocol = "https:";
  url.hostname = CANONICAL_HOST;
  return url;
}

export function middleware(req: NextRequest): NextResponse {
  const currentUrl = new URL(req.url);
  const normalized = stripSearchHash(currentUrl.pathname);
  const host = currentUrl.hostname.toLowerCase();
  const proto = currentUrl.protocol.replace(":", "");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const effectiveProto = forwardedProto
    ? forwardedProto.split(",")[0]?.trim()
    : proto;
  const canonicalPath = getLegacyRedirectPath(normalized);
  const skipCanonicalRedirect = isLocalHost(host);
  const shouldRedirectProto = effectiveProto === "http";
  const shouldApplyLegacyRedirect =
    canonicalPath !== null && canonicalPath !== normalized;

  if (shouldApplyLegacyRedirect) {
    const [legacyBase, legacyHash] = canonicalPath.split("#");
    const canonicalUrl = shouldEnforceCanonicalHost(host)
      ? buildCanonicalUrl(req)
      : new URL(req.url);
    canonicalUrl.pathname = legacyBase || "/";
    canonicalUrl.search = currentUrl.search;
    canonicalUrl.hash = legacyHash ? `#${legacyHash}` : "";
    return NextResponse.redirect(canonicalUrl, { status: 301 });
  }

  if (
    !skipCanonicalRedirect &&
    shouldEnforceCanonicalHost(host) &&
    (host === CANONICAL_HOST_WITHOUT_WWW || shouldRedirectProto)
  ) {
    const canonicalUrl = buildCanonicalUrl(req);
    canonicalUrl.pathname = normalized;
    canonicalUrl.search = currentUrl.search;
    return NextResponse.redirect(canonicalUrl, { status: 308 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)", "/robots.txt", "/sitemap.xml"],
};
