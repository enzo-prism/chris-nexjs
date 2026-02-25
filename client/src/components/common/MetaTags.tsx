interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  canonicalPath?: string;
  url?: string;
  type?: string;
  robots?: string;
}

export default function MetaTags(_props: MetaTagsProps) {
  // Next.js App Router metadata is the SEO source of truth.
  // This component remains as a compatibility shim while legacy pages are migrated.
  return null;
}
