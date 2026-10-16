import * as React from "react";
import { cn } from "@/lib/utils";
import type { FAQEntry } from "@/lib/structuredData";

export type FAQSectionProps = {
  readonly title?: string;
  readonly subtitle?: string;
  readonly items: readonly FAQEntry[];
  readonly className?: string;
};

function renderAnswer(answer: string): React.ReactNode {
  const blocks = answer
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, blockIndex) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const isBulleted = lines.length > 1 && lines.every((line) => line.startsWith("- "));

    if (isBulleted) {
      const bullets = lines.map((line) => line.replace(/^- /, "").trim());
      return (
        <ul key={blockIndex} className="list-disc space-y-1 pl-5">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      );
    }

    return <p key={blockIndex}>{block}</p>;
  });
}

/** FAQ band (native <details>, zero JS). Questions are H3s for outline. */
export default function FAQSection({
  title = "Frequently asked questions",
  subtitle,
  items,
  className,
}: FAQSectionProps): React.JSX.Element | null {
  if (!items.length) return null;

  return (
    <section className={cn("bg-cream-100 py-16 sm:py-20", className)}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8">
        {title ? (
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="h-section mt-4 text-balance">{title}</h2>
            {subtitle ? <p className="lead mt-4">{subtitle}</p> : null}
          </div>
        ) : null}

        <div className="divide-y divide-cream-300/80 rounded-[1.75rem] border border-cream-300/80 bg-white">
          {items.map((item, index) => (
            <details key={item.question} className="faq-item group" open={index === 0}>
              <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-6 px-5 py-4 text-left sm:px-7">
                <h3 className="font-heading text-lg font-medium leading-snug text-ink sm:text-xl">
                  {item.question}
                </h3>
                <span
                  className="faq-plus flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-evergreen-50 text-xl leading-none text-evergreen-700 group-open:bg-evergreen-800 group-open:text-gold-300"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <div className="prose-rooted space-y-3 px-5 pb-6 sm:px-7">{renderAnswer(item.answer)}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
