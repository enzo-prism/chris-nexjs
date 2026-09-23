// Patient words shown on the homepage. Each `text` must appear verbatim in
// shared/googleReviewsData.ts under the same reviewer name; the check lives in
// scripts/homepage-proof.test.ts (run by `pnpm test:reviews`). Do not edit a
// quote here without re-checking it against the review export.

export type HomeProofQuote = {
  readonly name: string;
  readonly text: string;
  readonly context: string;
};

export const homeProofQuotes: readonly HomeProofQuote[] = [
  {
    name: "Martha Hauch",
    text: "Dr. Wong is an incredibly skilled dentist & I like that he is conservative in his approach to work that may be needed",
    context: "On Dr. Wong",
  },
  {
    name: "Darice Koo",
    text: "The hygienist Angelisa is great! Very pleasant manner, explains things throughly, does great work!",
    context: "On the hygiene team",
  },
  {
    name: "Michael Austin",
    text: "Been getting my dental care at this office for nearly 30 years, and both my parents did so before me.",
    context: "A patient for nearly 30 years",
  },
];
