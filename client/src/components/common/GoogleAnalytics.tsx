"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ANALYTICS_CONSENT_EVENT,
  isAnalyticsPathExcluded,
  normalizeAnalyticsPath,
} from "@shared/analytics";
import {
  hasAnalyticsConsent,
  isAnalyticsRuntimeEnabled,
  trackGAEvent,
} from "@/lib/analytics";

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-94WRBJY51J";

const BOOKING_PATHS = new Set(["/schedule", "/zoom-whitening/schedule"]);

const getAnchorLabel = (anchor: HTMLAnchorElement): string => {
  const text = anchor.textContent?.trim();
  if (text) return text.slice(0, 120);

  const ariaLabel = anchor.getAttribute("aria-label")?.trim();
  if (ariaLabel) return ariaLabel.slice(0, 120);

  const title = anchor.getAttribute("title")?.trim();
  if (title) return title.slice(0, 120);

  return "unlabeled_link";
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
      window.gtag("event", "page_view", {
        send_to: GA_MEASUREMENT_ID,
        page_path: fullPath,
        page_location: currentLocation,
        page_title: document.title,
        ...(pageReferrer ? { page_referrer: pageReferrer } : {}),
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

      if (!isAnalyticsRuntimeEnabled()) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const rawHref = anchor.getAttribute("href")?.trim();
      if (!rawHref) return;

      const linkText = getAnchorLabel(anchor);

      if (rawHref.startsWith("tel:")) {
        trackGAEvent("tel_click", {
          link_text: linkText,
          phone_number: rawHref.replace(/^tel:/i, ""),
          page_path: normalizedPathname,
        });
        return;
      }

      if (rawHref.startsWith("mailto:")) {
        trackGAEvent("email_click", {
          email_address: rawHref.replace(/^mailto:/i, ""),
          link_text: linkText,
          page_path: normalizedPathname,
        });
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
        trackGAEvent("book_appointment_click", {
          destination_path: destinationPath,
          link_text: linkText,
          page_path: normalizedPathname,
        });
        return;
      }

      if (destinationUrl.origin !== window.location.origin) {
        trackGAEvent("outbound_click", {
          destination_host: destinationUrl.hostname,
          destination_url: destinationUrl.href,
          link_text: linkText,
          page_path: normalizedPathname,
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
