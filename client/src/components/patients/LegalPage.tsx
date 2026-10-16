import type { ReactNode } from "react";
import { ChevronDown, Mail, MapPin, Phone } from "lucide-react";

import { PageHero } from "@/components/ds/PageHero";
import { officeInfo } from "@/lib/data";

export type LegalSection = {
  /** Anchor id (kebab-case). */
  readonly id: string;
  readonly title: string;
  readonly content: ReactNode;
};

type LegalPageProps = {
  readonly title: string;
  readonly crumbName: string;
  readonly path: string;
  readonly eyebrow?: string;
  /** Version / effective-date line under the H1. */
  readonly meta?: ReactNode;
  readonly lead?: ReactNode;
  readonly sections: readonly LegalSection[];
  /** Heading of the closing contact card, e.g. "Privacy Officer". */
  readonly contactRole?: string;
  readonly contactTitle?: string;
  readonly contactIntro?: ReactNode;
  /** Extra content after the contact card (e.g. federal complaint address). */
  readonly after?: ReactNode;
};

// Typography for long legal copy (Tailwind typography, tuned to Rooted tokens).
const proseClass =
  "prose prose-lg max-w-none text-ink-soft prose-headings:scroll-mt-28 prose-headings:font-heading prose-headings:font-medium prose-headings:tracking-[-0.01em] prose-headings:text-ink prose-h2:mb-4 prose-h2:mt-0 prose-h2:text-[1.6rem] sm:prose-h2:text-[1.85rem] prose-h3:mb-2 prose-h3:mt-7 prose-h3:text-[1.2rem] prose-p:leading-8 prose-a:font-semibold prose-a:text-evergreen-700 prose-a:decoration-gold-500/60 prose-strong:text-ink prose-li:my-1 prose-li:marker:text-gold-500";

/** Quiet, readable layout for legal pages: H1, version line, a table of
 *  contents (sticky on desktop, a disclosure on phones), and a contact card. */
export function LegalPage({
  title,
  crumbName,
  path,
  eyebrow = "Policies",
  meta,
  lead,
  sections,
  contactRole,
  contactTitle = "Contact us",
  contactIntro,
  after,
}: LegalPageProps) {
  const toc = (
    <ol className="grid gap-0.5 text-[15px]">
      {sections.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            className="flex min-h-11 items-center rounded-xl px-3 py-1.5 leading-snug text-ink-soft transition-colors hover:bg-cream-100 hover:text-evergreen-800"
          >
            {section.title}
          </a>
        </li>
      ))}
      <li>
        <a
          href="#legal-contact"
          className="flex min-h-11 items-center rounded-xl px-3 py-1.5 leading-snug text-ink-soft transition-colors hover:bg-cream-100 hover:text-evergreen-800"
        >
          {contactTitle}
        </a>
      </li>
    </ol>
  );

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: crumbName, path },
        ]}
        eyebrow={eyebrow}
        title={title}
        lead={lead}
        actions={null}
        showReviews={false}
        className="[&>div]:pb-10 sm:[&>div]:pb-12"
      >
        {meta ? <p className="mt-5 text-[15px] font-medium text-ink-muted">{meta}</p> : null}
      </PageHero>

      <section className="bg-white py-10 sm:py-14 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14 lg:px-8">
          <nav aria-label="On this page" className="lg:sticky lg:top-[calc(var(--header-height,76px)+1.5rem)] lg:self-start">
            <details className="group rounded-[1.25rem] border border-cream-300/80 bg-cream-50 lg:hidden">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                On this page
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-evergreen-700 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="border-t border-cream-300/80 p-2">{toc}</div>
            </details>
            <div className="hidden lg:block">
              <p className="px-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">On this page</p>
              <div className="mt-2">{toc}</div>
            </div>
          </nav>

          <article className="min-w-0 max-w-3xl">
            <div className={proseClass}>
              {sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                  className={index > 0 ? "mt-10 border-t border-cream-300/70 pt-10" : undefined}
                >
                  <h2 id={`${section.id}-title`}>{section.title}</h2>
                  {section.content}
                </section>
              ))}
            </div>

            <section
              id="legal-contact"
              aria-labelledby="legal-contact-title"
              className="mt-12 scroll-mt-28 rounded-[1.75rem] bg-cream-100 p-6 sm:p-8"
            >
              <h2 id="legal-contact-title" className="h-card text-[1.6rem] sm:text-[1.85rem]">
                {contactTitle}
              </h2>
              {contactIntro ? (
                <p className="mt-3 text-[1.0625rem] leading-8 text-ink-soft">{contactIntro}</p>
              ) : null}
              <address className="mt-5 grid gap-1 not-italic leading-7 text-ink">
                {contactRole ? <span className="block font-semibold">{contactRole}</span> : null}
                <span className="block font-semibold">{officeInfo.name}</span>
                <span className="mt-1 flex items-start gap-2.5 text-ink-soft">
                  <MapPin className="mt-1.5 h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
                  <span>
                    {officeInfo.address.line1}
                    <br />
                    {officeInfo.address.line2}
                  </span>
                </span>
                <a
                  href={`tel:${officeInfo.phoneE164}`}
                  className="link-rooted inline-flex min-h-11 w-fit items-center gap-2.5"
                  data-analytics-context="legal-call"
                >
                  <Phone className="h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
                  <span>
                    <span className="sr-only">Phone: </span>
                    {officeInfo.phone}
                  </span>
                </a>
                <a
                  href={`mailto:${officeInfo.email}`}
                  className="link-rooted inline-flex min-h-11 w-fit max-w-full items-center gap-2.5 break-all"
                  data-analytics-context="legal-email"
                >
                  <Mail className="h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
                  <span>
                    <span className="sr-only">Email: </span>
                    {officeInfo.email}
                  </span>
                </a>
              </address>
            </section>

            {after}
          </article>
        </div>
      </section>
    </>
  );
}

export default LegalPage;
