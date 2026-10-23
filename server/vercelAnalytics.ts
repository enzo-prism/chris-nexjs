import type { NextRequest } from "next/server";
import { track } from "@vercel/analytics/server";
import {
  sanitizeAnalyticsEventName,
  sanitizeVercelEventProperties,
} from "@shared/analytics";
import { isAllowedAnalyticsHost } from "@shared/analyticsHosts";

function requestHostname(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-host");
  const host =
    forwarded ?? request.headers.get("host") ?? request.nextUrl.hostname;
  return host.split(",")[0]?.trim() ?? "";
}

function canSendVercelServerAnalytics(request: NextRequest): boolean {
  if (!isAllowedAnalyticsHost(requestHostname(request))) return false;
  return Boolean(
    process.env.VERCEL_URL || process.env.VERCEL_WEB_ANALYTICS_ENDPOINT,
  );
}

export async function trackVercelServerEvent(
  request: NextRequest,
  eventName: string,
  properties: Record<string, unknown> = {},
): Promise<void> {
  const sanitizedEventName = sanitizeAnalyticsEventName(eventName);
  if (!sanitizedEventName || !canSendVercelServerAnalytics(request)) return;

  const sanitizedProperties = sanitizeVercelEventProperties(
    sanitizedEventName,
    properties,
  );

  try {
    await track(sanitizedEventName, sanitizedProperties, {
      request: {
        headers: request.headers,
      },
    });
  } catch {
    // Ignore analytics transport errors so request handling stays reliable.
  }
}
