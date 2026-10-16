import { usePathname } from "next/navigation";
import { supplementalContentByPath } from "@/lib/supplementalContent";

function normalizePath(value: string): string {
  const pathname = value.split(/[?#]/)[0] || "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/** Extra planning copy for a route (`lib/supplementalContent.ts`), rendered by
 *  the shell after the page's closing call to action as a quiet "more detail"
 *  appendix: two columns of short notes on a paper band. */
const SupplementalContent = () => {
  const pathname = usePathname() || "/";
  const path = normalizePath(pathname);
  const blocks = supplementalContentByPath[path];

  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="More details"
      className="border-t border-cream-300/70 bg-cream-50 py-14 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="eyebrow">Good to know</p>
        <div className="mt-6 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {blocks.map((block, index) => (
            <div key={`${path}-${index}`} className="max-w-prose">
              <h2 className="h-card">{block.heading}</h2>
              {block.paragraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={`${path}-${index}-p-${paragraphIndex}`}
                  className="prose-rooted mt-3 text-[15px] leading-7 sm:text-base sm:leading-7"
                >
                  {paragraph}
                </p>
              ))}
              {block.bullets && block.bullets.length > 0 ? (
                <ul className="mt-4 space-y-2 text-[15px] leading-6 text-ink-soft">
                  {block.bullets.map((item, itemIndex) => (
                    <li key={`${path}-${index}-b-${itemIndex}`} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SupplementalContent;
