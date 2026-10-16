import assert from "node:assert/strict";

import { homeProofQuotes } from "../client/src/data/homeProof";
import { featuredQuote, homeRibbonQuotes } from "../client/src/data/reviewHighlights";
import { drWong, team } from "../client/src/data/team";
import { serviceReviews } from "../client/src/data/serviceReviews";
import { googleReviewSeedData } from "../shared/googleReviewsData";

type Quote = { readonly name: string; readonly text: string };

// Every patient quote on the site must be a real, verbatim excerpt of a
// published 5-star Google review by the named reviewer.
function assertVerbatim(quote: Quote, where: string): void {
  const reviews = googleReviewSeedData.filter((entry) => entry.name === quote.name);
  assert.ok(reviews.length, `${where}: no Google review found for "${quote.name}"`);
  const match = reviews.find((review) => review.text.includes(quote.text));
  assert.ok(
    match,
    `${where}: quote for "${quote.name}" is not a verbatim excerpt of their review:\n  quote:  ${quote.text}\n  review: ${reviews.map((r) => r.text).join("\n          ")}`,
  );
  assert.equal(match.rating, 5, `${where}: "${quote.name}" is not a 5-star review`);
}

const quotes: [Quote, string][] = [
  ...homeProofQuotes.map((q): [Quote, string] => [q, "homeProof"]),
  ...homeRibbonQuotes.map((q): [Quote, string] => [q, "reviewHighlights.homeRibbonQuotes"]),
  [featuredQuote, "reviewHighlights.featuredQuote"],
  [drWong.quote, "team.drWong"],
  ...serviceReviews.map((q): [Quote, string] => [q, "serviceReviews"]),
  ...team.flatMap((m): [Quote, string][] => (m.quote ? [[m.quote, `team.${m.slug}`]] : [])),
];
for (const [quote, where] of quotes) assertVerbatim(quote, where);

// "Named in N+ reviews" badges must never overstate the real count.
const mentionCount = (name: string) =>
  googleReviewSeedData.filter((review) => new RegExp(`\\b${name}\\b`, "i").test(review.text)).length;
const mentionChecks: [string, number | undefined][] = [
  ["Wong", drWong.mentions],
  ...team.map((m): [string, number | undefined] => [m.name.replace(/^Dr\.\s+\S+\s+/, "").split(" ")[0]!, m.mentions]),
];
for (const [name, claimed] of mentionChecks) {
  if (claimed === undefined) continue;
  const actual = mentionCount(name);
  assert.ok(claimed <= actual, `"${name}" is claimed in ${claimed} reviews but only ${actual} mention it`);
}

console.log(`Review quote guard passed (${quotes.length} verbatim quotes, mention counts verified).`);
