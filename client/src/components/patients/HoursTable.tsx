"use client";

import { useEffect, useState } from "react";

import { officeInfo } from "@/lib/data";
import { cn } from "@/lib/utils";

const days = [
  ["Monday", "monday"],
  ["Tuesday", "tuesday"],
  ["Wednesday", "wednesday"],
  ["Thursday", "thursday"],
  ["Friday", "friday"],
  ["Saturday", "saturday"],
  ["Sunday", "sunday"],
] as const;

type HoursTableProps = {
  readonly className?: string;
  readonly caption?: string;
};

/**
 * Weekly hours from officeInfo. Today's row is highlighted only after mount
 * (office-local day depends on the visitor's clock; rendering it on the
 * server would mismatch on hydration).
 */
export function HoursTable({ className, caption = "Regular office hours" }: HoursTableProps) {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "America/Los_Angeles" }).format(
        new Date(),
      ),
    );
  }, []);

  return (
    <table className={cn("w-full border-collapse text-[15px]", className)}>
      <caption className="sr-only">{caption}</caption>
      <tbody>
        {days.map(([label, key]) => {
          const value = officeInfo.hours[key];
          const closed = value.toLowerCase() === "closed";
          const isToday = today === label;
          return (
            <tr
              key={key}
              className={cn(
                "border-b border-cream-300/70 last:border-b-0",
                isToday && "bg-evergreen-50/80",
              )}
            >
              <th
                scope="row"
                className={cn(
                  "py-2.5 pl-3 pr-4 text-left font-medium text-ink",
                  isToday && "font-semibold text-evergreen-800",
                )}
              >
                {label}
                {isToday ? (
                  <span className="ml-2 rounded-full bg-evergreen-800 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-cream-50">
                    Today
                  </span>
                ) : null}
              </th>
              <td
                className={cn(
                  "py-2.5 pr-3 text-right tabular-nums",
                  closed ? "text-ink-muted" : "text-ink-soft",
                  isToday && !closed && "font-semibold text-evergreen-800",
                )}
              >
                {value.replace(" - ", "–")}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default HoursTable;
