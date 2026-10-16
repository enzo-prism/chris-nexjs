import type { ReviewQuote } from "@/components/ds/Reviews";

// Short patient quotes used across the site (homepage ribbon, team cards,
// service pages). Every `text` must be a verbatim excerpt of the named
// reviewer's 5-star review in shared/googleReviewsData.ts —
// scripts/homepage-proof.test.ts (part of `pnpm test:reviews`) enforces it.
// Keep the reviewer's typos and emoji; never paraphrase.

export const homeRibbonQuotes: readonly ReviewQuote[] = [
  {
    name: "Anne Starr",
    text: "Dr. Hamamoto did great passing her practice to Dr. Wong! He is great! Helen and Angelisa are the best dental hygienists!",
    context: "On the practice handoff",
  },
  {
    name: "Jimmy",
    text: "Dr Wong was amazing! The most gentle and attentive dentist I have ever!!!",
    context: "On Dr. Wong",
  },
  {
    name: "Jan Austin",
    text: "Angelisa is my Angel. I never cry tears during her care😇",
    context: "On Angelisa",
  },
  {
    name: "Irma Gali",
    text: "My whole family comes here and we feel very taken care of. Dr. Wong and his staff are the best.",
    context: "A family of patients",
  },
  {
    name: "Billy Lee",
    text: "Been coming for a decade. Never had a cavity. Helen is the best hygienist!",
    context: "On Helen",
  },
  {
    name: "Michael Austin",
    text: "Been getting my dental care at this office for nearly 30 years, and both my parents did so before me.",
    context: "A patient for nearly 30 years",
  },
  {
    name: "Madison Ho",
    text: "Dr. Wong is such a kind and wonderful doctor.",
    context: "After an urgent visit",
  },
  {
    name: "Charlotte Hallenbeck",
    text: "Incredible office and staff! Been coming here my entire life and especially love Angelisa",
    context: "A lifelong patient",
  },
  {
    name: "Martha Hauch",
    text: "Dr. Wong is an incredibly skilled dentist & I like that he is conservative in his approach to work that may be needed",
    context: "On Dr. Wong’s approach",
  },
  {
    name: "Lawan Jackson",
    text: "Easy to park. The staff is very helpful. Helen is the best hygienist I’ve ever had.",
    context: "On visiting the office",
  },
  {
    name: "Darice Koo",
    text: "The hygienist Angelisa is great! Very pleasant manner, explains things throughly, does great work!",
    context: "On the hygiene team",
  },
  {
    name: "Amy Hamachi",
    text: "He was easy to talk to and had a reasonable plan of care of my teeth.",
    context: "On a first visit",
  },
  {
    name: "sarah willis",
    text: "Angelisa is the best!! I love when I go in and see her, she will put a smile on your face.",
    context: "On Angelisa",
  },
  {
    name: "Kevin Zhang",
    text: "Dr Wong is very with the times, down to earth, and gives practical, but conservative advice",
    context: "On Dr. Wong",
  },
];

/** A larger "hero" quote for the reviews feature. */
export const featuredQuote: ReviewQuote = {
  name: "Michael Austin",
  text: "Been getting my dental care at this office for nearly 30 years, and both my parents did so before me. Kind and caring, gentle and good, and reasonably priced!",
  context: "Google review",
};
