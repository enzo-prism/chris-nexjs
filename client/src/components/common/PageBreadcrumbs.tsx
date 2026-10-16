import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbTrailItem = {
  name: string;
  path: string;
};

interface PageBreadcrumbsProps {
  items: BreadcrumbTrailItem[];
  className?: string;
  containerClassName?: string;
  /** Render inline (inside a hero) instead of as its own band. */
  inline?: boolean;
}

/** Visible breadcrumb trail (pair with buildBreadcrumbSchema for JSON-LD). */
const PageBreadcrumbs = ({ items, className, containerClassName, inline = false }: PageBreadcrumbsProps) => {
  if (!items || items.length < 2) return null;

  const trail = (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-ink-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.path}-${index}`} className="inline-flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="font-semibold text-ink-soft">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="rounded-sm underline-offset-4 transition-colors hover:text-evergreen-800 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-evergreen-500"
                >
                  {item.name}
                </Link>
              )}
              {!isLast ? <ChevronRight className="h-3.5 w-3.5 text-cream-400" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );

  if (inline) return trail;

  return (
    <div className={cn("border-b border-cream-300/70 bg-cream-50", containerClassName)}>
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">{trail}</div>
    </div>
  );
};

export default PageBreadcrumbs;
