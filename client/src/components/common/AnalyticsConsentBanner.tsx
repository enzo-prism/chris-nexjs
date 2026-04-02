"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { setAnalyticsConsent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { ANALYTICS_CONSENT_STORAGE_KEY } from "@shared/analytics";
import { cn } from "@/lib/utils";

const AnalyticsConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname() || "/";
  const isConversionRoute = pathname === "/schedule";

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedConsent = window.localStorage.getItem(
        ANALYTICS_CONSENT_STORAGE_KEY,
      );
      if (savedConsent === "granted" || savedConsent === "denied") {
        setIsVisible(false);
        return;
      }
    } catch (_error) {
      // Ignore storage errors and keep banner visible.
    }

    setIsVisible(true);
  }, []);

  const handleConsent = (granted: boolean) => {
    setAnalyticsConsent(granted);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed z-[120] border border-slate-200 bg-white/95 shadow-lg backdrop-blur",
        isConversionRoute
          ? "bottom-3 left-3 right-3 rounded-2xl p-3 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.55)] md:bottom-4 md:left-1/2 md:right-auto md:w-[min(42rem,calc(100%-2rem))] md:-translate-x-1/2"
          : "bottom-4 left-4 right-4 rounded-xl p-4 md:left-auto md:w-[520px]",
      )}
    >
      <div
        className={cn(
          isConversionRoute ? "sm:flex sm:items-center sm:justify-between sm:gap-4" : "",
        )}
      >
        <p className={cn("text-slate-700", isConversionRoute ? "text-xs sm:text-sm sm:flex-1" : "text-sm")}>
          {isConversionRoute
            ? "Analytics cookies are optional. Accept if you'd like to help us improve the site experience."
            : "We only enable analytics cookies after you choose Accept. This helps us understand website performance and improve your experience while respecting your privacy choice."}
        </p>
        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            isConversionRoute ? "mt-3 sm:mt-0 sm:justify-end" : "mt-3",
          )}
        >
          <Button
            type="button"
            onClick={() => handleConsent(true)}
            className={cn(
              "bg-slate-900 text-white transition hover:bg-slate-800",
              isConversionRoute
                ? "min-h-8 rounded-full px-3 py-1.5 text-[11px] font-semibold sm:min-h-9 sm:text-xs"
                : "rounded-md px-3 py-2 text-sm font-medium",
            )}
          >
            Accept Analytics
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleConsent(false)}
            className={cn(
              "border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50",
              isConversionRoute
                ? "min-h-8 rounded-full px-3 py-1.5 text-[11px] font-semibold sm:min-h-9 sm:text-xs"
                : "rounded-md px-3 py-2 text-sm font-medium",
            )}
          >
            Decline
          </Button>
          <a
            href="/privacy-policy"
            className={cn(
              "font-medium text-blue-700 hover:text-blue-800",
              isConversionRoute ? "text-[11px] sm:text-xs" : "text-sm",
            )}
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsConsentBanner;
