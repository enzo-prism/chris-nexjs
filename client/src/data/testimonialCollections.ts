export const testimonialCollections = {
  homeSpotlight: [
    "Anne Starr",
    "Anat Sipres",
    "Amy Hamachi",
    "Sarah Chase",
    "Michael Austin",
    "Alan Truscott",
  ],
  serviceHub: [
    "Steve Collins",
    "Sandi Spires",
    "Michael Austin",
  ],
  preventiveDentistry: [
    "Ashley Chung",
    "Anat Sipres",
    "Sarah Chase",
  ],
  pediatricDentistry: [
    "Ashley Chung",
    "Alan Truscott",
    "Michael Austin",
  ],
  dentalCleaning: [
    "ally dino",
    "Josh Grinberg",
    "Anat Sipres",
  ],
  cavityFillings: [
    "Avinash Shetty",
    "Steve Collins",
    "Sarah Chase",
  ],
  crowns: [
    "Laurie Sefton",
    "Sandi Spires",
    "Paul McBurney",
  ],
  teethWhitening: [
    "Andrew",
    "mj",
    "Sarah Chase",
  ],
  zoomWhitening: [
    "Andrew",
    "mj",
    "Sarah Chase",
  ],
  patientResources: [
    "Barbara Cruz",
    "Amy Hamachi",
    "Anat Sipres",
  ],
  scheduleFunnel: [
    "Amy Hamachi",
    "Rana Naqvi",
    "Anat Sipres",
  ],
} as const;

export type TestimonialCollectionKey = keyof typeof testimonialCollections;
