"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
} from "@shared/analytics";

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-94WRBJY51J";

const GoogleAnalytics = () => {
  const pathname = usePathname() || "/";
  const lastTrackedPathRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const fullPath = `${pathname}${window.location.search || ""}`;

    const hasGrantedConsent = () => {
      try {
        return (
          window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY) === "granted"
        );
      } catch (_error) {
        return false;
      }
    };

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const sendPageView = (force = false) => {
      if (!hasGrantedConsent()) return;

      if (typeof window.gtag !== "function") {
        if (attempts < 20) {
          attempts += 1;
          timer = setTimeout(sendPageView, 150);
        }
        return;
      }

      clearTimer();

      if (!force && lastTrackedPathRef.current === fullPath) return;
      lastTrackedPathRef.current = fullPath;
      window.gtag("event", "page_view", {
        send_to: GA_MEASUREMENT_ID,
        page_path: fullPath,
        page_location: window.location.href,
        page_title: document.title,
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
  }, [pathname]);

  return null;
};

export default GoogleAnalytics;
