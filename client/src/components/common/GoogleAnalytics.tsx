import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";

const GA_MEASUREMENT_ID = "G-94WRBJY51J";
const GA_SCRIPT_ID = "ga-gtag-script";

// This component handles Google Analytics page view tracking for SPAs
const GoogleAnalytics = () => {
  const [location] = useLocation();
  const pendingPathRef = useRef<string | null>(null);
  const isLoadedRef = useRef(false);

  const loadAnalyticsScript = useCallback(() => {
    if (typeof window === "undefined" || isLoadedRef.current) return;

    isLoadedRef.current = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag(...args: any[]) {
        window.dataLayer?.push(args);
      };

    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });

    if (!document.getElementById(GA_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = GA_SCRIPT_ID;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      script.onload = () => {
        const pendingPath = pendingPathRef.current;
        if (pendingPath && window.gtag) {
          window.gtag("config", GA_MEASUREMENT_ID, { page_path: pendingPath });
          pendingPathRef.current = null;
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  // Track page views
  const trackPageView = useCallback((path: string) => {
    if (typeof window === "undefined") return;

    if ("gtag" in window && typeof window.gtag === "function") {
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: path,
      });
      return;
    }
    pendingPathRef.current = path;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const load = () => loadAnalyticsScript();
    const interactionEvents = ["pointerdown", "keydown", "touchstart", "scroll"];

    interactionEvents.forEach((event) =>
      window.addEventListener(event, load, { once: true, passive: true }),
    );

    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(load, { timeout: 2000 });
    } else {
      idleTimer = setTimeout(load, 1800);
    }

    return () => {
      interactionEvents.forEach((event) =>
        window.removeEventListener(event, load),
      );
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [loadAnalyticsScript]);

  // Listen for location changes and send page views to GA
  useEffect(() => {
    trackPageView(location);
  }, [location, trackPageView]);

  return null; // This component doesn't render anything
};

export default GoogleAnalytics;
