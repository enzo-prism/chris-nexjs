import { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

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
  return (
    <main className="min-h-screen w-full bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-slate-900">404 Page Not Found</h1>
          </div>
          <p className="mb-6 text-sm text-slate-600">
            Did you forget to add the page to the router?
          </p>
          <Link
            href="/"
            className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
