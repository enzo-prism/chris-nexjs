import type { NextRequest } from "next/server";
import { track } from "@vercel/analytics/server";
import {
  sanitizeAnalyticsEventName,
  sanitizeAnalyticsEventProperties,
} from "@shared/analytics";

function canSendVercelServerAnalytics(): boolean {
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
  if (!sanitizedEventName || !canSendVercelServerAnalytics()) return;

  const sanitizedProperties = sanitizeAnalyticsEventProperties(properties);

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
