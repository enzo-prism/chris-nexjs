import type { NextRequest } from "next/server";
import { track } from "@vercel/analytics/server";
import {
  sanitizeAnalyticsEventName,
  sanitizeVercelEventProperties,
} from "@shared/analytics";

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
  capturedServerEvents?.push({
    name: eventName,
    properties: { ...properties },
  });
  const sanitizedEventName = sanitizeAnalyticsEventName(eventName);
  if (!sanitizedEventName || !canSendVercelServerAnalytics()) return;

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
