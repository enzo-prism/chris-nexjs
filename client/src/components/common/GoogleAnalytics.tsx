import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-94WRBJY51J";

const GoogleAnalytics = () => {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const lastTrackedPathRef = useRef<string>("");

  const fullPath = useMemo(() => {
    const queryString = searchParams?.toString() ?? "";
    return queryString ? `${pathname}?${queryString}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const sendPageView = () => {
      if (typeof window.gtag !== "function") {
        if (attempts < 20) {
          attempts += 1;
          timer = setTimeout(sendPageView, 150);
        }
        return;
      }

      if (lastTrackedPathRef.current === fullPath) return;
      lastTrackedPathRef.current = fullPath;
      window.gtag("event", "page_view", {
        send_to: GA_MEASUREMENT_ID,
        page_path: fullPath,
        page_location: window.location.href,
        page_title: document.title,
      });
    };

    sendPageView();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [fullPath]);

  return null;
};

export default GoogleAnalytics;
