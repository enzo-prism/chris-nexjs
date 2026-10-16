import Link from "next/link";
import { MapPin } from "lucide-react";

/** One-sentence "patients visit from…" line (no long city lists). */
export function NearbyLine({ subject = "Patients" }: { readonly subject?: string }) {
  return (
    <section aria-label="Nearby communities" className="bg-white px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
      <p className="mx-auto flex max-w-3xl items-start justify-center gap-2.5 rounded-[1.5rem] border border-cream-300/80 bg-cream-50 px-5 py-4 text-[15px] leading-7 text-ink-soft sm:text-center">
        <MapPin className="mt-1 h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
        <span>
          {subject} visit our Cambridge Avenue office from{" "}
          <Link href="/dentist-menlo-park" className="link-rooted">
            Menlo Park
          </Link>
          ,{" "}
          <Link href="/dentist-stanford" className="link-rooted">
            Stanford
          </Link>
          ,{" "}
          <Link href="/dentist-mountain-view" className="link-rooted">
            Mountain View
          </Link>{" "}
          and Los Altos; see all the{" "}
          <Link href="/locations" className="link-rooted">
            areas we serve
          </Link>
          .
        </span>
      </p>
    </section>
  );
}

export default NearbyLine;
