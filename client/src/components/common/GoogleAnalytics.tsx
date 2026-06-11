"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_CONSENT_EVENT,
  getAnalyticsPageContext,
  isAnalyticsPathExcluded,
  normalizeAnalyticsPath,
} from "@shared/analytics";
import {
  hasAnalyticsConsent,
  isAnalyticsRuntimeEnabled,
  trackAnalyticsEvent,
} from "@/lib/analytics";

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-94WRBJY51J";

const BOOKING_PATHS = new Set(["/schedule", "/zoom-whitening/schedule"]);

// AI assistants that send measurable referral traffic. Detected from the
// external referrer on the first page view of a visit so AI-driven sessions
// can be segmented in GA4 (the param is attached to every page_view of the
// page load that carried the referrer).
const AI_REFERRER_SOURCES: ReadonlyArray<{ host: string; source: string }> = [
  { host: "chatgpt.com", source: "chatgpt" },
  { host: "chat.openai.com", source: "chatgpt" },
  { host: "perplexity.ai", source: "perplexity" },
  { host: "copilot.microsoft.com", source: "copilot" },
  { host: "gemini.google.com", source: "gemini" },
  { host: "claude.ai", source: "claude" },
];

const getAiReferrerSource = (): string | null => {
  if (typeof document === "undefined" || !document.referrer) return null;
  try {
    const referrerHost = new URL(document.referrer).hostname.toLowerCase();
    for (const { host, source } of AI_REFERRER_SOURCES) {
      if (referrerHost === host || referrerHost.endsWith(`.${host}`)) {
        return source;
      }
    }
  } catch (_error) {
    return null;
  }
  return null;
};

const getAnchorLabel = (anchor: HTMLAnchorElement): string => {
  const text = anchor.textContent?.trim();
  if (text) return text.slice(0, 80);

  const ariaLabel = anchor.getAttribute("aria-label")?.trim();
  if (ariaLabel) return ariaLabel.slice(0, 80);

  const title = anchor.getAttribute("title")?.trim();
  if (title) return title.slice(0, 80);

  return "unlabeled_link";
};

const getCtaContext = (anchor: HTMLAnchorElement): string => {
  const declaredContext = (
    anchor.closest("[data-analytics-context]") as HTMLElement | null
  )?.dataset.analyticsContext?.trim();

  if (declaredContext) {
    return declaredContext.slice(0, 40);
  }

  if (anchor.closest("header")) return "header";
  if (anchor.closest("footer")) return "footer";
  if (anchor.closest("nav")) return "navigation";
  if (anchor.closest("main")) return "body";
  return "unknown";
};

const GoogleAnalytics = () => {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const normalizedPathname = normalizeAnalyticsPath(pathname);
  const searchQuery = searchParams?.toString() ?? "";
  const lastTrackedPathRef = useRef<string>("");
  const lastTrackedLocationRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const fullPath = searchQuery
      ? `${normalizedPathname}?${searchQuery}`
      : normalizedPathname;
    const shouldSkipTracking = isAnalyticsPathExcluded(normalizedPathname);

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const sendPageView = (force = false) => {
      if (
        shouldSkipTracking ||
        !isAnalyticsRuntimeEnabled() ||
        !hasAnalyticsConsent()
      ) {
        return;
      }

      if (typeof window.gtag !== "function") {
        if (attempts < 20) {
          attempts += 1;
          timer = setTimeout(sendPageView, 150);
        }
        return;
      }

      clearTimer();

      if (!force && lastTrackedPathRef.current === fullPath) return;

      const currentLocation = window.location.href;
      const pageReferrer =
        lastTrackedLocationRef.current || document.referrer || undefined;

      lastTrackedPathRef.current = fullPath;
      lastTrackedLocationRef.current = currentLocation;
      const aiSource = getAiReferrerSource();
      window.gtag("event", "page_view", {
        send_to: GA_MEASUREMENT_ID,
        page_path: fullPath,
        page_location: currentLocation,
        page_title: document.title,
        ...(pageReferrer ? { page_referrer: pageReferrer } : {}),
        ...(aiSource ? { ai_source: aiSource } : {}),
      });
    };

    const handleConsentUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ granted?: boolean }>;
      if (customEvent.detail?.granted !== true) return;
      lastTrackedPathRef.current = "";
      attempts = 0;
      sendPageView(true);
    };

    window.addEventListener(
      ANALYTICS_CONSENT_EVENT,
      handleConsentUpdated as EventListener,
    );
    sendPageView();

    return () => {
      clearTimer();
      window.removeEventListener(
        ANALYTICS_CONSENT_EVENT,
        handleConsentUpdated as EventListener,
      );
    };
  }, [normalizedPathname, searchQuery]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isAnalyticsPathExcluded(normalizedPathname)) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const rawHref = anchor.getAttribute("href")?.trim();
      if (!rawHref) return;

      const pageContext = getAnalyticsPageContext(normalizedPathname);
      const clickContext = {
        ...pageContext,
        cta_context: getCtaContext(anchor),
        link_text: getAnchorLabel(anchor),
      };

      if (rawHref.startsWith("tel:")) {
        trackAnalyticsEvent(ANALYTICS_EVENTS.phoneCallClick, clickContext);
        return;
      }

      if (rawHref.startsWith("mailto:")) {
        trackAnalyticsEvent(ANALYTICS_EVENTS.emailClick, clickContext);
        return;
      }

      let destinationUrl: URL;
      try {
        destinationUrl = new URL(anchor.href, window.location.href);
      } catch (_error) {
        return;
      }

      const destinationPath = normalizeAnalyticsPath(destinationUrl.pathname);

      if (BOOKING_PATHS.has(destinationPath)) {
        trackAnalyticsEvent(ANALYTICS_EVENTS.bookAppointmentClick, {
          ...clickContext,
          destination_path: destinationPath,
        });
        return;
      }

      if (destinationUrl.origin !== window.location.origin) {
        trackAnalyticsEvent(ANALYTICS_EVENTS.outboundClick, {
          ...clickContext,
          destination_host: destinationUrl.hostname,
        });
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [normalizedPathname]);

  return null;
};

export default GoogleAnalytics;
