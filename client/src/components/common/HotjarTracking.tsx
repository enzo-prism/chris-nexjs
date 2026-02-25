import { useEffect } from 'react';

// Define types for Hotjar
interface HotjarWindow extends Window {
  hj?: any;
  _hjSettings: {
    hjid: number;
    hjsv: number;
  };
}

// This component initializes Hotjar tracking
const HotjarTracking = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hotjarWindow = window as unknown as HotjarWindow;
    const SCRIPT_ID = "hotjar-script";

    const loadHotjar = () => {
      if (document.getElementById(SCRIPT_ID)) return;

      hotjarWindow.hj =
        hotjarWindow.hj ||
        function () {
          (hotjarWindow.hj as any).q = (hotjarWindow.hj as any).q || [];
          (hotjarWindow.hj as any).q.push(arguments);
        };

      hotjarWindow._hjSettings = { hjid: 5170965, hjsv: 6 };

      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `https://static.hotjar.com/c/hotjar-${hotjarWindow._hjSettings.hjid}.js?sv=${hotjarWindow._hjSettings.hjsv}`;
      document.head.appendChild(script);
    };

    const triggerEvents = ["pointerdown", "keydown", "touchstart"];
    triggerEvents.forEach((event) =>
      window.addEventListener(event, loadHotjar, { once: true, passive: true }),
    );

    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(loadHotjar, { timeout: 3000 });
    } else {
      idleTimer = setTimeout(loadHotjar, 2500);
    }

    return () => {
      triggerEvents.forEach((event) => window.removeEventListener(event, loadHotjar));
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default HotjarTracking;
