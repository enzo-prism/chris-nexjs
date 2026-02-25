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

    const isBulleted =
      lines.length > 1 && lines.every((line) => line.startsWith("- "));

    if (isBulleted) {
      const bullets = lines.map((line) => line.replace(/^- /, "").trim());
      return (
        <ul
          key={blockIndex}
          className="list-disc space-y-1 pl-5 text-slate-700 leading-relaxed"
        >
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={blockIndex} className="text-slate-700 leading-relaxed">
        {block}
      </p>
    );
  });
}

export default function FAQSection({
  title = "Frequently asked questions",
  subtitle,
  items,
  className,
}: FAQSectionProps): JSX.Element | null {
  if (!items.length) return null;

  return (
    <section className={cn("py-12 bg-[#F5F9FC]", className)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="text-center mb-8 space-y-3">
            <h2 className="text-3xl font-bold font-heading text-slate-900">
              {title}
            </h2>
            {subtitle && (
              <p className="text-slate-700 max-w-3xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="space-y-5">
          {items.map((item) => (
            <div
              key={item.question}
              className="bg-white rounded-2xl border border-slate-100 px-6 py-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {item.question}
              </h3>
              <div className="space-y-3">{renderAnswer(item.answer)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

