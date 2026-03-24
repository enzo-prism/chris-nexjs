"use client";

import {
  Analytics,
  type BeforeSendEvent,
} from "@vercel/analytics/next";
import { isAnalyticsUrlExcluded } from "@shared/analytics";

const beforeSend = (event: BeforeSendEvent): BeforeSendEvent | null => {
  return isAnalyticsUrlExcluded(event.url) ? null : event;
};

export default function VercelAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
