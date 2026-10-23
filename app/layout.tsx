import type { Metadata } from "next";
import { Figtree, Newsreader } from "next/font/google";
import { getSeoForPath } from "@/lib/seo";
import VercelAnalytics from "@/components/common/VercelAnalytics";
import { SeasonScript } from "@/components/seasonal/SeasonScript";
import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
} from "@shared/analytics";
import {
  ANALYTICS_IMMEDIATE_LOAD_FLAG,
  analyticsHostAllowlistGuardSnippet,
} from "@shared/analyticsHosts";
import "./globals.css";

// Self-hosted via next/font (subset, size-adjusted fallbacks, no third-party
// font request). "Rooted" type pairing — see docs/design-system.md:
// Figtree for body/UI, Newsreader (the editorial serif used by the
// "Full Circle" film captions) for headings.
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-heading",
  // On a slow first visit, keep the size-adjusted fallback instead of
  // repainting the hero heading late and extending text-based LCP.
  display: "optional",
});

const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ??
  process.env.GOOGLE_SITE_VERIFICATION;
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-94WRBJY51J";
// Google Ads tag ("AW-…"). Optional — configured alongside GA so ad
// conversions and remarketing activate as soon as the env var is set.
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "";

const googleTagBootstrap = `
  // Remember the entry URL and referrer before any client-side navigation so
  // lead attribution (client/src/lib/attribution.ts) sees the real landing page.
  window.__cwEntry = window.__cwEntry || { href: location.href, referrer: document.referrer };
  (function () {
    ${analyticsHostAllowlistGuardSnippet()}
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = window.gtag || gtag;
  gtag('js', new Date());

  var storedAnalyticsConsent = null;
  try {
    storedAnalyticsConsent = window.localStorage.getItem('${ANALYTICS_CONSENT_STORAGE_KEY}');
  } catch (_error) {}
  var analyticsConsent = storedAnalyticsConsent === 'denied' ? 'denied' : 'granted';

  // Essential measurement remains enabled unless a visitor opts out. Advertising
  // storage and personalization stay denied because this site has no ad-consent UI.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: analyticsConsent
  });

  window.setAnalyticsConsent = function setAnalyticsConsent(granted) {
    const state = granted ? 'granted' : 'denied';
    gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: state
    });
    window.dispatchEvent(new CustomEvent('${ANALYTICS_CONSENT_EVENT}', {
      detail: { granted: state === 'granted' }
    }));
    try {
      window.localStorage.setItem('${ANALYTICS_CONSENT_STORAGE_KEY}', state);
    } catch (_error) {}
  };

  gtag('config', '${GA_MEASUREMENT_ID}', {
    send_page_view: false,
    transport_type: 'beacon'
  });
${GOOGLE_ADS_ID ? `  gtag('config', '${GOOGLE_ADS_ID}');` : ""}

  // Load the external gtag.js on idle or first interaction instead of
  // eagerly: the stub above queues every command in dataLayer, so nothing is
  // lost, and ~100KB of third-party JS stays off the critical path.
  (function () {
    var gaLoaded = false;
    var triggerEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    function loadGtagScript() {
      if (gaLoaded) return;
      gaLoaded = true;
      triggerEvents.forEach(function (eventName) {
        window.removeEventListener(eventName, loadGtagScript);
      });
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
      document.head.appendChild(script);
    }
    triggerEvents.forEach(function (eventName) {
      window.addEventListener(eventName, loadGtagScript, { once: true, passive: true });
    });
    if (window.${ANALYTICS_IMMEDIATE_LOAD_FLAG}) {
      loadGtagScript();
      return;
    }
    // Keep non-essential analytics outside the Core Web Vitals window when a
    // visitor has not interacted. Interaction still loads immediately so
    // conversion events are not lost.
    window.addEventListener('load', function scheduleDeferredGtag() {
      setTimeout(function () {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadGtagScript, { timeout: 4000 });
        } else {
          loadGtagScript();
        }
      }, 4000);
    }, { once: true });
  })();
  })();
`;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.chriswongdds.com"),
  title: getSeoForPath("/").title,
  description: getSeoForPath("/").description,
  alternates: {
    types: {
      "application/rss+xml": "https://www.chriswongdds.com/rss.xml",
    },
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png" },
      { url: "/favicon/favicon-32x32.png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification,
      }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${newsreader.variable}`}
      // The inline season script sets data-cw-season before hydration.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: googleTagBootstrap }} />
        <SeasonScript />
      </head>
      <body className="antialiased">
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
