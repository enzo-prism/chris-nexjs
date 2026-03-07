import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { getSeoForPath } from "@/lib/seo";
import CopyDashSanitizer from "@/components/common/CopyDashSanitizer";
import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
} from "@shared/analytics";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link
          rel="preconnect"
          href="https://www.googletagmanager.com"
          crossOrigin=""
        />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script dangerouslySetInnerHTML={{ __html: googleTagBootstrap }} />
      </head>
      <body className="antialiased">
        <CopyDashSanitizer />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
