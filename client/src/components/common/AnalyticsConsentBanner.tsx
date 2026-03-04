"use client";

import { useEffect, useState } from "react";
import { setAnalyticsConsent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

const CONSENT_STORAGE_KEY = "analytics_consent";

const AnalyticsConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedConsent = window.localStorage.getItem(CONSENT_STORAGE_KEY);
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
    <div className="fixed bottom-4 left-4 right-4 z-[120] rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur md:left-auto md:w-[520px]">
      <p className="text-sm text-slate-700">
        We only enable analytics cookies after you choose Accept. This helps us
        understand website performance and improve your experience while
        respecting your privacy choice.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => handleConsent(true)}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Accept Analytics
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleConsent(false)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Decline
        </Button>
        <a
          href="/privacy-policy"
          className="text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          Privacy Policy
        </a>
      </div>
    </div>
  );
};

export default AnalyticsConsentBanner;
