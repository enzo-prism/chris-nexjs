import { buildExcerpt } from "./seo";

type BlogSeoOverride = {
  pageTitle?: string;
  description: string;
};

type BlogSeoInput = {
  slug: string;
  title: string;
  content: string;
};

const BLOG_SEO_OVERRIDES: Record<string, BlogSeoOverride> = {
  "custom-sports-mouthguard-palo-alto": {
    description:
      "Learn when kids need a custom sports mouthguard, how it compares with store-bought options, and why Palo Alto families may want one before spring sports.",
  },
  "are-dental-sealants-worth-it-for-kids-palo-alto": {
    description:
      "Wondering if dental sealants are worth it for your child? Learn how sealants help prevent cavities, when kids should get them, and what Palo Alto parents should expect.",
  },
  "night-guard-teeth-grinding-palo-alto": {
    description:
      "Waking up with jaw tension, headaches, or worn teeth? Learn when a custom night guard may help protect your smile and when Palo Alto patients should get checked.",
  },
  "why-is-my-tooth-sensitive-to-cold-palo-alto": {
    description:
      "Learn common reasons a tooth feels sensitive to cold, how to tell when it may be a cavity or crack, and when to see a Palo Alto dentist for relief.",
  },
  "bleeding-gums-when-flossing-palo-alto": {
    description:
      "Wondering why your gums bleed when you floss? Learn the common causes, what is normal, and when to book a visit with Dr. Christopher B. Wong in Palo Alto.",
  },
  "dental-implants-vs-bridge-palo-alto": {
    description:
      "Comparing dental implants and dental bridges for people in Palo Alto. Learn the pros, timeline, costs, and what to expect so you can choose the right long-term tooth replacement for your smile.",
  },
};

export function getBlogSeoMetadata(post?: BlogSeoInput | null): {
  title: string;
  description: string;
} | null {
  if (!post) return null;

  const override = BLOG_SEO_OVERRIDES[post.slug];

  return {
    title: override?.pageTitle ?? `${post.title} | Christopher B. Wong, DDS`,
    description: override?.description ?? buildExcerpt(post.content),
  };
}
