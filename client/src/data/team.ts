import type { ReviewQuote } from "@/components/ds/Reviews";

export type TeamGroup = "dentist" | "hygiene" | "clinical" | "front";

export type TeamMember = {
  readonly slug: string;
  readonly name: string;
  readonly role: string;
  readonly group: TeamGroup;
  readonly image: string;
  /** CSS object-position for the portrait crop. */
  readonly focus?: string;
  /** Short, verifiable line from the bio. */
  readonly highlight: string;
  readonly bio: string;
  /** Year they joined, only where the bio states it. */
  readonly since?: number;
  /** Reviews that mention this person by name (scripts/homepage-proof.test.ts). */
  readonly mentions?: number;
  /** A verbatim review excerpt about this person. */
  readonly quote?: ReviewQuote;
};

// Bios follow client/src/lib/data.ts (teamMembers); keep them in sync.
export const team: readonly TeamMember[] = [
  {
    slug: "angelisa",
    name: "Angelisa",
    role: "Registered Dental Hygienist",
    group: "hygiene",
    image: "/images/team/angelisa.png",
    focus: "50% 25%",
    since: 2008,
    highlight: "Caring for patients here since 2008",
    bio: "A proud mother of three boys, Angelisa is committed to helping patients feel at ease while providing exceptional care.",
    mentions: 18,
    quote: {
      name: "Randy Hauch",
      text: "I've been going to Angelisa for cleanings for many years now! She is so much fun!",
    },
  },
  {
    slug: "helen",
    name: "Helen",
    role: "Registered Dental Hygienist",
    group: "hygiene",
    image: "/images/helen_headshot.png",
    focus: "50% 25%",
    highlight: "More than 15 years of dental hygiene",
    bio: "A UCSD graduate, Helen has practiced in Japan and San Diego and has three grown children.",
    mentions: 13,
    quote: {
      name: "Billy Lee",
      text: "Been coming for a decade. Never had a cavity. Helen is the best hygienist!",
    },
  },
  {
    slug: "kaye",
    name: "Kaye",
    role: "Registered Dental Hygienist",
    group: "hygiene",
    image: "/images/team/kaye.jpeg",
    focus: "50% 30%",
    since: 2024,
    highlight: "Honors graduate, Carrington College",
    bio: "Kaye graduated with honors in Dental Hygiene from Carrington College in San Jose and is also a licensed Doctor of Dental Medicine in the Philippines.",
  },
  {
    slug: "jamal",
    name: "Jamal",
    role: "Registered Dental Assistant",
    group: "clinical",
    image: "/images/team/jamal.jpeg",
    focus: "50% 30%",
    highlight: "Chairside support and comfort",
    bio: "Jamal provides excellent chairside support to our dentists and makes sure patients are comfortable during procedures.",
  },
  {
    slug: "rachel",
    name: "Rachel",
    role: "Insurance Coordinator & Front-Desk Lead",
    group: "front",
    image: "/images/team/rachel.jpeg",
    focus: "50% 30%",
    since: 2019,
    highlight: "Your guide to benefits and costs",
    bio: "A San Jose State graduate, Rachel has worked at the office since 2019. She loves arts and crafts, Asian dramas, and time with family and friends.",
    mentions: 2,
    quote: {
      name: "George Fisher",
      text: "Rachel was terrific, and Dr. Hamamoto always is.",
    },
  },
  {
    slug: "kelty",
    name: "Kelty",
    role: "Scheduling Coordinator",
    group: "front",
    image: "/images/team/kelty.jpeg",
    focus: "50% 30%",
    highlight: "Finds the visit time that works for you",
    bio: "A native San Franciscan and Loyola Marymount graduate, Kelty was introduced to dentistry by her mother, a retired dentist and dental professor at UCSF and University of the Pacific.",
  },
  {
    slug: "dr-pearl-tran",
    name: "Dr. Pearl Tran",
    role: "Periodontist",
    group: "dentist",
    image: "/images/team/dr-pearl-tran.png",
    focus: "50% 25%",
    highlight: "Diplomate, American Board of Periodontology",
    bio: "A Navy veteran, Dr. Tran specializes in periodontics and orofacial pain and cares for patients’ gum and periodontal health.",
  },
];

export const drWong = {
  name: "Dr. Christopher B. Wong",
  role: "Dentist & practice owner",
  image: "/images/about/dr-wong-portrait.webp",
  mentions: 38,
  quote: {
    name: "Amy Hamachi",
    text: "Dr. Wong was very pleasant and seemed willing to listen to any questions that I had. He was easy to talk to and had a reasonable plan of care of my teeth. I would recommend him.",
  } satisfies ReviewQuote,
} as const;
