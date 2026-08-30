import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { hasAnalyticsConsent } from "@/lib/analytics";

// Define types for Hotjar
interface HotjarWindow extends Window {
  hj?: ((...args: unknown[]) => void) & { q?: IArguments[] };
  _hjSettings: {
    hjid: number;
    hjsv: number;
  };
}

// This component initializes Hotjar tracking
const HotjarTracking = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sensitivePaths = new Set([
      "/schedule",
      "/contact",
      "/thank-you",
      "/zoom-whitening/schedule",
    ]);
    if (sensitivePaths.has(pathname) || !hasAnalyticsConsent()) return;

    const hotjarWindow = window as unknown as HotjarWindow;
    const SCRIPT_ID = "hotjar-script";

    const loadHotjar = () => {
      if (document.getElementById(SCRIPT_ID)) return;

      hotjarWindow.hj =
        hotjarWindow.hj ||
        function (...args: unknown[]) {
          if (!hotjarWindow.hj) return;
          hotjarWindow.hj.q = hotjarWindow.hj.q || [];
          hotjarWindow.hj.q.push(arguments);
        };

      hotjarWindow._hjSettings = { hjid: 5170965, hjsv: 6 };

      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `https://static.hotjar.com/c/hotjar-${hotjarWindow._hjSettings.hjid}.js?sv=${hotjarWindow._hjSettings.hjsv}`;
      document.head.appendChild(script);
    };

    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let idleCallbackId: number | undefined;

    const scheduleHotjar = () => {
      idleTimer = setTimeout(() => {
        if ("requestIdleCallback" in window) {
          idleCallbackId = window.requestIdleCallback(loadHotjar, { timeout: 8000 });
        } else {
          loadHotjar();
        }
      }, 8000);
    };

    if (document.readyState === "complete") {
      scheduleHotjar();
    } else {
      window.addEventListener("load", scheduleHotjar, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleHotjar);
      if (idleTimer) clearTimeout(idleTimer);
      if (idleCallbackId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId);
      }
    };
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default HotjarTracking;
