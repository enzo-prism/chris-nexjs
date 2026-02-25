import { useLocation } from "wouter";
import Container from "@/components/layout/Container";
import PageSection from "@/components/layout/PageSection";
import { supplementalContentByPath } from "@/lib/supplementalContent";

function normalizePath(value: string): string {
  const pathname = value.split(/[?#]/)[0] || "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

const SupplementalContent = () => {
  const [location] = useLocation();
  const path = normalizePath(location);
  const blocks = supplementalContentByPath[path];

  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <PageSection className="bg-white border-t border-slate-100" spacing="md">
      <Container size="lg">
        <div className="space-y-10">
          {blocks.map((block, index) => (
            <div
              key={`${path}-${index}`}
              className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:text-[#1F2933] prose-p:text-slate-700 prose-li:text-slate-700 prose-li:marker:text-slate-400"
            >
              <h2>{block.heading}</h2>
              {block.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={`${path}-${index}-p-${paragraphIndex}`}>{paragraph}</p>
              ))}
              {block.bullets && block.bullets.length > 0 ? (
                <ul>
                  {block.bullets.map((item, itemIndex) => (
                    <li key={`${path}-${index}-b-${itemIndex}`}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </PageSection>
  );
};

export default SupplementalContent;
