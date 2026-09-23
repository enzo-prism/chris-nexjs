import assert from "node:assert/strict";

import { homeProofQuotes } from "../client/src/data/homeProof";
import { googleReviewSeedData } from "../shared/googleReviewsData";

// Homepage review quotes must be real, verbatim excerpts of published 5-star
// Google reviews by the named reviewer.
for (const quote of homeProofQuotes) {
  const review = googleReviewSeedData.find((entry) => entry.name === quote.name);
  assert.ok(review, `No Google review found for "${quote.name}"`);
  assert.equal(review.rating, 5, `"${quote.name}" is not a 5-star review`);
  assert.ok(
    review.text.includes(quote.text),
    `Homepage quote for "${quote.name}" is not a verbatim excerpt of the review:\n  quote:  ${quote.text}\n  review: ${review.text}`,
  );
}

console.log(`Homepage proof guard passed (${homeProofQuotes.length} verbatim quotes).`);
