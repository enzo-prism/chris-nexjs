import { Metadata } from "next";
import NotFoundPanel from "@/components/common/NotFoundPanel";

export const metadata: Metadata = {
  title: "Page Not Found | Christopher B. Wong, DDS",
  description: "Page not found. Return to Dr. Wong's Palo Alto dental practice homepage or contact our office.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://www.chriswongdds.com/404",
  },
  openGraph: {
    title: "Page Not Found | Christopher B. Wong, DDS",
    description:
      "Page not found. Return to Dr. Wong's Palo Alto dental practice homepage or contact our office.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function NotFoundPage() {
  return <NotFoundPanel />;
}
