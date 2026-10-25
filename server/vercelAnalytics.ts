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

type CapturedServerEvent = {
  readonly name: string;
  readonly properties: Record<string, unknown>;
};

let capturedServerEvents: CapturedServerEvent[] | null = null;

export function startCapturingVercelServerEventsForTests(): void {
  capturedServerEvents = [];
}

export function takeVercelServerEventsForTests(): CapturedServerEvent[] {
  const events = capturedServerEvents ?? [];
  capturedServerEvents = null;
  return events;
}

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
  capturedServerEvents?.push({
    name: eventName,
    properties: { ...properties },
  });
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
