import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { ServiceIcon, type ServiceIconName } from "@/components/ds/ServiceIcon";

export type CompareColumn = {
  readonly name: string;
  readonly icon?: ServiceIconName;
  /** Short line under the name, e.g. "One visit". */
  readonly note?: string;
};

export type CompareRow = {
  readonly label: string;
  /** One value per column, in column order. */
  readonly values: readonly ReactNode[];
};

/**
 * Side-by-side comparison as a real table (screen-reader friendly), built for
 * two options. Phones: each row's label sits on its own line above the values,
 * so the options get the full width. Wider screens: a classic label column.
 */
export function CompareTable({
  columns,
  rows,
  caption,
  className,
}: {
  readonly columns: readonly CompareColumn[];
  readonly rows: readonly CompareRow[];
  /** Visually hidden caption describing the comparison. */
  readonly caption: string;
  readonly className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[1.75rem] border border-cream-300/80 bg-white shadow-soft", className)}>
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-evergreen-900 text-cream-50">
            <td className="hidden p-5 sm:table-cell sm:w-[13rem]">
              <span className="sr-only">Compare</span>
            </td>
            {columns.map((column) => (
              <th key={column.name} scope="col" className="p-4 align-top font-normal sm:p-5">
                <span className="flex items-center gap-3">
                  {column.icon ? (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold-300 sm:h-11 sm:w-11 sm:rounded-2xl">
                      <ServiceIcon name={column.icon} className="h-6 w-6" animated={false} />
                    </span>
                  ) : null}
                  <span className="min-w-0">
                    <span className="block font-heading text-[1.1rem] font-medium leading-snug sm:text-[1.25rem]">
                      {column.name}
                    </span>
                    {column.note ? (
                      <span className="mt-0.5 block text-xs font-semibold text-evergreen-100/85 sm:text-sm">{column.note}</span>
                    ) : null}
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        {rows.map((row) => (
          <tbody key={row.label} className="border-t border-cream-300/70 even:bg-cream-50">
            <tr className="sm:hidden">
              <th
                scope="colgroup"
                colSpan={columns.length}
                className="px-4 pb-0 pt-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted"
              >
                {row.label}
              </th>
            </tr>
            <tr className="align-top">
              <th
                scope="row"
                className="hidden p-5 text-xs font-bold uppercase leading-snug tracking-[0.12em] text-ink-muted sm:table-cell"
              >
                {row.label}
              </th>
              {row.values.map((value, i) => (
                <td key={i} className="w-1/2 px-4 pb-3.5 pt-1.5 text-[15px] leading-6 text-ink sm:w-auto sm:p-5">
                  {value}
                </td>
              ))}
            </tr>
          </tbody>
        ))}
      </table>
    </div>
  );
}

export default CompareTable;
