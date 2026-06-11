import type { Metadata } from "next";
import { Lato, Source_Sans_3 } from "next/font/google";
import { getSeoForPath } from "@/lib/seo";
import CopyDashSanitizer from "@/components/common/CopyDashSanitizer";
import VercelAnalytics from "@/components/common/VercelAnalytics";
import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
} from "@shared/analytics";
import "./globals.css";

// Self-hosted via next/font: the Tailwind font stacks referenced these
// families for years without any webfont actually loading (visitors saw
// system-ui). next/font subsets, self-hosts, and generates size-adjusted
// fallbacks, so the brand typography finally renders with no layout shift
// and no third-party font request.
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-heading",
  display: "swap",
});

const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ??
  process.env.GOOGLE_SITE_VERIFICATION;
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-94WRBJY51J";

const googleTagBootstrap = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = window.gtag || gtag;
  gtag('js', new Date());

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

  window.setAnalyticsConsent = function setAnalyticsConsent(granted) {
    const state = granted ? 'granted' : 'denied';
    gtag('consent', 'update', {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state
    });
    window.dispatchEvent(new CustomEvent('${ANALYTICS_CONSENT_EVENT}', {
      detail: { granted: state === 'granted' }
    }));
    try {
      window.localStorage.setItem('${ANALYTICS_CONSENT_STORAGE_KEY}', state);
    } catch (_error) {}
  };

  try {
    var persistedConsent = window.localStorage.getItem('${ANALYTICS_CONSENT_STORAGE_KEY}');
    if (persistedConsent === 'granted' || persistedConsent === 'denied') {
      window.setAnalyticsConsent(persistedConsent === 'granted');
    }
  } catch (_error) {}

  gtag('config', '${GA_MEASUREMENT_ID}', {
    send_page_view: false,
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    transport_type: 'beacon'
  });

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
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadGtagScript, { timeout: 3000 });
    } else {
      setTimeout(loadGtagScript, 2500);
    }
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
    <html lang="en" className={`${sourceSans.variable} ${lato.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link
          rel="preconnect"
          href="https://www.googletagmanager.com"
          crossOrigin=""
        />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <script dangerouslySetInnerHTML={{ __html: googleTagBootstrap }} />
      </head>
      <body className="antialiased">
        <CopyDashSanitizer />
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
