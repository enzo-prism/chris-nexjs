import type { NextRequest } from "next/server";
import { track } from "@vercel/analytics/server";
import {
  sanitizeAnalyticsEventName,
  sanitizeVercelEventProperties,
} from "@shared/analytics";
import {
  canSendServerAnalytics,
  hostnameFromRequestHeaders,
} from "@shared/analyticsHosts";

export function requestHostname(request: NextRequest): string {
  return hostnameFromRequestHeaders(
    request.headers,
    request.nextUrl.hostname,
  );
}

export function canSendVercelServerAnalytics(request: NextRequest): boolean {
  return canSendServerAnalytics(requestHostname(request), process.env);
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
