import { normalizePathname } from "@shared/seo";
import { getLegacyRedirectPath } from "@shared/redirects";

export function getPathFromSlugParams(params: {
  slug?: string[];
}): string {
  if (!params.slug || params.slug.length === 0) {
    return "/";
  }
  return normalizePathname(`/${params.slug.join("/")}`);
}

export function getCanonicalRouteData(pathname: string): string {
  const legacyRedirect = getLegacyRedirectPath(pathname);
  if (!legacyRedirect) {
    return pathname;
  }

  return legacyRedirect.split("#")[0] || "/";
}
