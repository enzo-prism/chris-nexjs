"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { changelogEntries, type ChangelogEntry } from "@/data/changelog";
import { PageHero } from "@/components/ds/PageHero";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

const typeStyles: Record<ChangelogEntry["type"], string> = {
  feature: "border-evergreen-200 bg-evergreen-50 text-evergreen-800",
  fix: "border-gold-300 bg-gold-200/50 text-gold-700",
  update: "border-cream-300 bg-cream-100 text-ink-soft",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

// Entries carry plain YYYY-MM-DD dates. Format them by hand (no Date or
// locale APIs) so the label is identical on the server and in every browser.
const formatDate = (value: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${Number(match[3])}, ${match[1]}` : value;
};

const normalize = (value: string) => value.trim().replace(/[.!?]+$/, "").toLowerCase();

/** 1 … 4 5 6 … 59 — a short, tappable window instead of one button per page. */
function pageWindow(current: number, total: number): (number | "gap")[] {
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1]! > 1) out.push("gap");
    out.push(page);
  });
  return out;
}

export default function Changelog() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(changelogEntries.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const visibleEntries = changelogEntries.slice(startIndex, endIndex);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }
    setCurrentPage(nextPage);
    document.getElementById("updates")?.scrollIntoView({ block: "start" });
  };

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Site updates", path: "/changelog" },
        ]}
        eyebrow="Changelog"
        title="Site updates"
        lead="What changed on this website, newest first. It includes updates from both the legacy and rebuilt site histories."
        actions={null}
        showReviews={false}
        className="[&>div]:pb-10 sm:[&>div]:pb-12"
      />

      <section id="updates" className="scroll-mt-24 bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {changelogEntries.length === 0 ? (
            <p className="card p-6 text-ink-soft">
              No changelog entries have been loaded yet. We will add updates here as soon as new changes are pushed.
            </p>
          ) : null}

          <ol className="relative grid gap-4">
            <span
              aria-hidden="true"
              className="absolute bottom-4 left-[0.45rem] top-4 hidden w-px bg-gradient-to-b from-gold-400 via-evergreen-200 to-transparent sm:block"
            />
            {visibleEntries.map((entry) => {
              const showSummary = normalize(entry.summary) !== normalize(entry.title);
              return (
                <li key={entry.sha} className="relative sm:pl-8">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-7 hidden h-[0.95rem] w-[0.95rem] rounded-full border-2 border-gold-400 bg-cream-50 sm:block"
                  />
                  <article className="card p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                      <time dateTime={entry.date} className="font-semibold text-ink-soft">
                        {formatDate(entry.date)}
                      </time>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em]",
                          typeStyles[entry.type],
                        )}
                      >
                        {entry.type}
                      </span>
                      <span className="text-xs text-ink-muted">{entry.source}</span>
                    </div>
                    <h2 className="mt-3 font-heading text-[1.3rem] font-medium leading-snug text-ink">
                      {entry.title}
                    </h2>
                    {showSummary ? (
                      <p className="mt-1.5 text-[15px] leading-7 text-ink-soft">{entry.summary}</p>
                    ) : null}
                    <a
                      href={entry.commitUrl}
                      className="link-rooted mt-2 inline-flex min-h-11 items-center gap-1 text-sm"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View commit ({entry.sha})
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </article>
                </li>
              );
            })}
          </ol>

          {changelogEntries.length > ITEMS_PER_PAGE ? (
            <nav aria-label="Changelog pagination" className="mt-10 grid gap-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="btn btn-outline btn-sm disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ArrowLeft aria-hidden="true" />
                  Previous
                </button>
                <p className="text-center text-sm text-ink-muted">
                  Showing {startIndex + 1}–{Math.min(endIndex, changelogEntries.length)} of{" "}
                  {changelogEntries.length}
                </p>
                <button
                  type="button"
                  className="btn btn-outline btn-sm disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ArrowRight aria-hidden="true" />
                </button>
              </div>

              <ul className="flex flex-wrap justify-center gap-1.5">
                {pageWindow(currentPage, totalPages).map((item, i) =>
                  item === "gap" ? (
                    <li key={`gap-${i}`} aria-hidden="true" className="flex h-11 w-6 items-center justify-center text-ink-muted">
                      …
                    </li>
                  ) : (
                    <li key={item}>
                      <button
                        type="button"
                        className={cn(
                          "flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors focus-visible:shadow-[var(--ui-focus-shadow)] focus-visible:outline-none",
                          item === currentPage
                            ? "bg-evergreen-800 text-cream-50"
                            : "border border-cream-300 text-ink-soft hover:border-evergreen-300 hover:text-evergreen-800",
                        )}
                        onClick={() => handlePageChange(item)}
                        aria-current={item === currentPage ? "page" : undefined}
                        aria-label={`Page ${item}`}
                      >
                        {item}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          ) : null}
        </div>
      </section>
    </>
  );
}
