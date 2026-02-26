"use client";

import { useState } from "react";
import { Calendar, CircleDot, ArrowRight } from "lucide-react";
import { changelogEntries } from "@/data/changelog";

export default function Changelog() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(changelogEntries.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleEntries = changelogEntries.slice(startIndex, endIndex);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }
    setCurrentPage(nextPage);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.18em] text-primary font-semibold">
          Changelog
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1F2933] leading-tight">
          What changed on this website
        </h1>
        <p className="text-base sm:text-lg text-[#4b5563] max-w-2xl">
          We keep this page simple and easy to read. It includes website updates from
          both legacy and rebuilt site histories, with the newest update first.
        </p>
      </header>

        <div className="space-y-4">
        {changelogEntries.length === 0 ? (
          <article className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <p className="text-[#374151]">
              No changelog entries have been loaded yet. We will add updates here as soon
              as new changes are pushed.
            </p>
          </article>
        ) : null}
        {visibleEntries.map((entry) => (
          <article
            key={entry.sha}
            className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                <span>{entry.date}</span>
              </div>
              <span className="inline-flex items-center rounded-full border border-primary/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-primary">
                {entry.type}
              </span>
            </div>

            <p className="mt-2 text-xs uppercase tracking-[0.15em] text-slate-500">
              {entry.source}
            </p>

            <h2 className="text-lg sm:text-xl font-semibold text-[#111827] mt-3 mb-2 flex items-center gap-2">
              <CircleDot className="h-4 w-4 text-primary" />
              {entry.title}
            </h2>

            <p className="text-[#374151] leading-relaxed">{entry.summary}</p>

            <div className="mt-4">
              <a
                href={entry.commitUrl}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-[#1f6ef5]"
                target="_blank"
                rel="noreferrer"
              >
                View commit ({entry.sha}) <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </article>
        ))}
      </div>

      {changelogEntries.length > itemsPerPage ? (
        <nav
          aria-label="Changelog pagination"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <button
            type="button"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <p className="text-sm text-slate-600">
            Showing {startIndex + 1}-
            {Math.min(endIndex, changelogEntries.length)} of {changelogEntries.length}
          </p>

          <button
            type="button"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </nav>
      ) : null}

      {totalPages > 1 ? (
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
            const isActive = pageNumber === currentPage;
            return (
              <button
                key={pageNumber}
                type="button"
                className={`h-9 w-9 rounded-lg border text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white border-primary"
                    : "border-slate-300 text-slate-700 hover:border-primary/70 hover:text-primary hover:bg-primary/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                }`}
                onClick={() => handlePageChange(pageNumber)}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
