"use client";

import { useEffect, useState } from "react";
import {
  Analytics,
  type BeforeSendEvent,
} from "@vercel/analytics/next";
import { isAnalyticsUrlExcluded } from "@shared/analytics";
import { isAllowedAnalyticsHost } from "@shared/analyticsHosts";

const beforeSend = (event: BeforeSendEvent): BeforeSendEvent | null => {
  if (
    typeof window !== "undefined" &&
    !isAllowedAnalyticsHost(window.location.hostname)
  ) {
    return null;
  }
  return isAnalyticsUrlExcluded(event.url) ? null : event;
};

export default function VercelAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isAllowedAnalyticsHost(window.location.hostname));
  }, []);

  if (!enabled) return null;
  return <Analytics beforeSend={beforeSend} />;
}
