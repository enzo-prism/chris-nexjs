import type { ReviewQuote } from "@/components/ds/Reviews";

// Service-matched patient quotes for service and location pages.
// Rules (docs/seo-strategy notes, AGENTS.md):
// - every `text` is a verbatim excerpt of that reviewer's 5-star Google
//   review (scripts/homepage-proof.test.ts enforces it);
// - excerpts end on the reviewer's own sentence boundary (no mid-sentence cuts);
// - no quotes that credit former dentists for a service;
// - tags describe what the quote is actually about — never imply a general
//   review is about a specific treatment.
export type ReviewTag =
  | "cleaning"
  | "gentle"
  | "honest"
  | "fillings"
  | "emergency"
  | "family"
  | "visit";

type TaggedQuote = ReviewQuote & { readonly tags: readonly ReviewTag[] };

export const serviceReviews: readonly TaggedQuote[] = [
  {
    name: "Brad Baer",
    text: "The cleanings here with Helen are outstanding. Always thorough, knowledgeable, and friendly.",
    context: "On a cleaning with Helen",
    tags: ["cleaning"],
  },
  {
    name: "Steve Collins",
    text: "High skill level, modern tools, helpful guidance and a friendly demeanor. An excellent experience for cleanings and fillings. Strong recommend.",
    context: "On cleanings and fillings",
    tags: ["cleaning", "fillings"],
  },
  {
    name: "Billy Lee",
    text: "Been coming for a decade. Never had a cavity. Helen is the best hygienist!",
    context: "On preventive care",
    tags: ["cleaning"],
  },
  {
    name: "Ashley Chung",
    text: "Been going here for 10+ years since I was a kid. Great establishment and excellent teeth cleaning & guidance!",
    context: "A patient since childhood",
    tags: ["cleaning", "family"],
  },
  {
    name: "Jason Jones",
    text: "Dr. Wong's office is great! He is thorough, gentle, and always explains things clearly.",
    context: "On Dr. Wong",
    tags: ["gentle", "honest"],
  },
  {
    name: "Tim Senior",
    text: "Tremendous Doctor, listens well and very gentle and caring.",
    context: "On Dr. Wong",
    tags: ["gentle"],
  },
  {
    name: "Jimmy",
    text: "Dr Wong was amazing! The most gentle and attentive dentist I have ever!!!",
    context: "On Dr. Wong",
    tags: ["gentle"],
  },
  {
    name: "Brian Oswalt",
    text: "Dr. Wong was great! He was patient, thorough, and didn't push unnecessary treatment.",
    context: "On treatment advice",
    tags: ["honest"],
  },
  {
    name: "Andres Diaz",
    text: "Thoughtful dentist. Ask questions and listens to the patient.",
    context: "On Dr. Wong",
    tags: ["honest"],
  },
  {
    name: "Martha Hauch",
    text: "Dr. Wong is an incredibly skilled dentist & I like that he is conservative in his approach to work that may be needed",
    context: "On conservative care",
    tags: ["honest"],
  },
  {
    name: "Kai Jones",
    text: "Dr. Wong did a filling for me and it was literally pain free.",
    context: "On a filling",
    tags: ["fillings", "gentle"],
  },
  {
    name: "Madison Ho",
    text: "Dr. Wong is such a kind and wonderful doctor.",
    context: "After a Friday-evening dental emergency",
    tags: ["emergency"],
  },
  {
    name: "Paul Pedersen",
    text: "Best dentist in town (Palo Alto). Quick, efficient, accurate, helpful, accommodating. Made time for me twice - both minor emergencies, and once on the 4th of July weekend! Outstanding service.",
    context: "On urgent visits",
    tags: ["emergency"],
  },
  {
    name: "Irma Gali",
    text: "My whole family comes here and we feel very taken care of. Dr. Wong and his staff are the best.",
    context: "A family of patients",
    tags: ["family"],
  },
  {
    name: "Seth Leslie",
    text: "been receiving quality care since i was a kid - over 30 years. recommend!",
    context: "A patient for 30+ years",
    tags: ["family"],
  },
  {
    name: "Ross Veltman",
    text: "My experience spans three generations of my family and three generations of the practice",
    context: "Three generations of patients",
    tags: ["family"],
  },
  {
    name: "Lawan Jackson",
    text: "Easy to park. The staff is very helpful. Helen is the best hygienist I’ve ever had.",
    context: "On visiting the office",
    tags: ["visit", "cleaning"],
  },
];

/** Up to `limit` quotes whose tags include any of `tags`, in priority order. */
export function reviewsFor(tags: readonly ReviewTag[], limit = 3): ReviewQuote[] {
  const picked: ReviewQuote[] = [];
  for (const tag of tags) {
    for (const quote of serviceReviews) {
      if (picked.length >= limit) return picked;
      if (quote.tags.includes(tag) && !picked.some((p) => p.name === quote.name)) picked.push(quote);
    }
  }
  return picked;
}
