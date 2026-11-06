import type { ClinicalResource } from "@shared/clinicalResources";

/** Visible, crawlable primary-source links; no implied endorsement or review. */
export function ClinicalSources({
  resources,
}: {
  readonly resources: readonly ClinicalResource[];
}) {
  if (!resources.length) return null;
  return (
    <aside aria-label="Sources and further reading" className="mt-8 border-t border-cream-300/80 pt-6">
      <p className="text-sm font-semibold text-ink">Sources and further reading</p>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-ink-soft">
        {resources.map((resource) => (
          <li key={resource.url}>
            <a href={resource.url} className="link-rooted" target="_blank" rel="noopener noreferrer">
              {resource.title}<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <span className="block text-ink-muted">{resource.publisher}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
