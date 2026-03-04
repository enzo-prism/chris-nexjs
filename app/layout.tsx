import type { Metadata } from "next";
import { getSeoForPath } from "@/lib/seo";
import "./globals.css";

const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ??
  process.env.GOOGLE_SITE_VERIFICATION;
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-94WRBJY51J";
const CONSENT_STORAGE_KEY = "analytics_consent";
const EEA_AND_UK_REGION_CODES = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IS",
  "IE",
  "IT",
  "LV",
  "LI",
  "LT",
  "LU",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "GB",
] as const;

const googleTagBootstrap = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = window.gtag || gtag;
  gtag('js', new Date());

  gtag('consent', 'default', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted'
  });

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
    region: ${JSON.stringify(EEA_AND_UK_REGION_CODES)}
  });

  window.setAnalyticsConsent = function setAnalyticsConsent(granted) {
    const state = granted ? 'granted' : 'denied';
    gtag('consent', 'update', {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state
    });
    try {
      window.localStorage.setItem('${CONSENT_STORAGE_KEY}', state);
    } catch (_error) {}
  };

  try {
    var persistedConsent = window.localStorage.getItem('${CONSENT_STORAGE_KEY}');
    if (persistedConsent === 'granted' || persistedConsent === 'denied') {
      window.setAnalyticsConsent(persistedConsent === 'granted');
    }
  } catch (_error) {}

  gtag('config', '${GA_MEASUREMENT_ID}', {
    send_page_view: false,
    anonymize_ip: true
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
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script dangerouslySetInnerHTML={{ __html: googleTagBootstrap }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
