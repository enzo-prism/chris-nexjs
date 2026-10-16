import { cn } from "@/lib/utils";

// Facts come only from Dr. Wong's own words in the "Full Circle" film
// (public/videos/full-circle/full-circle.en.vtt). No dates: the film gives
// none, and we never invent them.
const generations = [
  {
    name: "Dr. Benson Kanemoto",
    role: "Dr. Hamamoto’s predecessor",
    body: "Dr. Hamamoto took over the practice from him. She tells Dr. Wong that his demeanor reminds her of Dr. Kanemoto’s.",
  },
  {
    name: "Dr. Kris Hamamoto",
    role: "Previous practice owner",
    body: "She met Dr. Wong at a study group and offered him the practice because it was a good fit, in personality and in dental philosophy.",
  },
  {
    name: "Dr. Christopher B. Wong",
    role: "Leading the practice today",
    body: "With Dr. Hamamoto’s blessing and the same team, he keeps the patient experience consistent with what she built, and builds on it.",
  },
] as const;

/** Growth rings: one ring per generation, the newest drawn in gold. */
function Rings({ count, current }: { readonly count: number; readonly current: boolean }) {
  const radii = [10, 17, 24].slice(0, count);
  return (
    <svg viewBox="0 0 56 56" className="reveal-draw h-full w-full" aria-hidden="true" fill="none">
      <circle cx="28" cy="28" r="27" className="fill-cream-50" />
      <circle cx="28" cy="28" r="3.2" className={current ? "fill-gold-500" : "fill-evergreen-600"} />
      {radii.map((r, i) => {
        const outer = i === radii.length - 1;
        return (
          <circle
            key={r}
            cx="28"
            cy="28"
            r={r}
            pathLength={1}
            strokeWidth={outer ? 2.2 : 1.4}
            className={outer && current ? "stroke-gold-500" : outer ? "stroke-evergreen-600" : "stroke-evergreen-300"}
          />
        );
      })}
    </svg>
  );
}

/** Kanemoto → Hamamoto → Wong, joined by a root line. */
export function PracticeLineage({ className }: { readonly className?: string }) {
  return (
    <ol className={cn("relative grid gap-6 lg:grid-cols-3 lg:gap-6", className)}>
      {/* Root line: vertical on phones, horizontal through the rings on desktop. */}
      <span
        aria-hidden="true"
        className="absolute bottom-10 left-[2.2rem] top-10 w-px bg-gradient-to-b from-evergreen-300 via-evergreen-400 to-gold-400 lg:hidden"
      />
      <span
        aria-hidden="true"
        className="absolute left-[16%] right-[16%] top-[2.75rem] hidden h-px bg-gradient-to-r from-evergreen-300 via-evergreen-400 to-gold-400 lg:block"
      />
      {generations.map((g, i) => {
        const current = i === generations.length - 1;
        return (
          <li key={g.name} className="reveal relative flex gap-5 lg:flex-col lg:items-center lg:gap-6 lg:text-center">
            <span
              className={cn(
                "relative z-10 flex h-[4.4rem] w-[4.4rem] shrink-0 rounded-full p-1 shadow-soft lg:h-[5.5rem] lg:w-[5.5rem]",
                current ? "bg-gold-200" : "bg-cream-200",
              )}
            >
              <Rings count={i + 1} current={current} />
            </span>
            <div
              className={cn(
                "card flex-1 p-5 sm:p-6 lg:w-full",
                current && "border-gold-300 bg-gradient-to-b from-gold-200/25 to-white",
              )}
            >
              <h3 className="h-card text-[1.3rem] sm:text-[1.45rem]">{g.name}</h3>
              <p className={cn("mt-1 text-sm font-semibold", current ? "text-gold-700" : "text-evergreen-700")}>{g.role}</p>
              <p className="mt-3 text-[15px] leading-7 text-ink-soft">{g.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default PracticeLineage;
