export type GalleryCategory = "Our Space" | "Patient Care" | "Technology" | "Our Team";

export type GalleryMediaItem = {
  id: string;
  kind: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  title: string;
  description: string;
  category: GalleryCategory;
  layout: "videoWide" | "photoStandard" | "photoTall";
  interaction: "tapToPlayLoopMuted" | "staticImage";
  /** ISO date for VideoObject schema when the src carries no Cloudinary version. */
  uploadDate?: string;
};

// Every photo and clip here is real footage of the office and team. Removed
// on 2026-10-16: the Cloudinary clip `dr-wong-office-2-10s-b3-varA` (AI
// footage: a clinician who isn't Dr. Wong and garbled signage), the duplicate
// copy of the hero clip, and two short Cloudinary clips that weren't verified
// frame by frame; the four self-hosted office-tour clips replace them.
const CLD = "https://res.cloudinary.com/dhqpqfw6w/image/upload";
// The office-tour clips shipped together on 2026-06-23 (self-hosted).
const TOUR_CLIPS_DATE = "2026-06-23";

export const heroVideo: GalleryMediaItem = {
  id: "hero-clinic-overview",
  kind: "video",
  src: "https://res.cloudinary.com/dhqpqfw6w/video/upload/v1772057711/chris_wong_dds_lgbxf4.mp4",
  poster: "/images/hero-office-1280.webp",
  alt: "Video highlights of the office: the garden courtyard and the front desk",
  title: "Office highlights",
  description: "A short look around the office, from the garden courtyard to the front desk.",
  category: "Our Space",
  layout: "videoWide",
  interaction: "tapToPlayLoopMuted",
};

export const galleryItems: readonly GalleryMediaItem[] = [
  // --- OUR SPACE ---
  {
    id: "photo-reception-area",
    kind: "image",
    src: "/images/redesign/office-entrance-dr-wong.webp",
    alt: "Dr. Christopher B. Wong in a white coat at the office entrance, beside the Christopher Wong D.D.S. sign and a sculpted pine",
    title: "A Warm Welcome",
    description: "Dr. Wong at the front entrance on Cambridge Avenue.",
    category: "Our Space",
    layout: "photoStandard",
    interaction: "staticImage",
  },
  {
    id: "video-office-walkthrough",
    kind: "video",
    src: "/videos/office-atrium.mp4",
    poster: "/images/tour/office-atrium-poster.webp",
    alt: "Video of the glass-walled garden courtyard at the center of the office",
    title: "Light-Filled Spaces",
    description: "The glass-walled courtyard at the heart of the office brings daylight into the treatment rooms.",
    category: "Our Space",
    layout: "videoWide",
    interaction: "tapToPlayLoopMuted",
    uploadDate: TOUR_CLIPS_DATE,
  },
  {
    id: "photo-quiet-garden-courtyard",
    kind: "image",
    src: "/images/office/quiet-garden-courtyard.webp",
    alt: "Quiet garden courtyard with a stone fountain, seen through the office’s glass walls",
    title: "The Courtyard Fountain",
    description: "A stone fountain and planted garden sit between the treatment rooms.",
    category: "Our Space",
    layout: "photoTall",
    interaction: "staticImage",
  },
  {
    id: "photo-reception-waiting",
    kind: "image",
    src: "/images/redesign/office-reception-waiting.webp",
    alt: "Reception and waiting area with wood-slat walls and navy seating",
    title: "Reception",
    description: "Wood-slat walls and soft navy seating greet you as you come in.",
    category: "Our Space",
    layout: "photoStandard",
    interaction: "staticImage",
  },
  {
    id: "photo-front-desk",
    kind: "image",
    src: "/images/redesign/office-front-desk-atrium.webp",
    alt: "Front desk with wood-slat panels beside the glass atrium",
    title: "The Front Desk",
    description: "The front desk sits right beside the glass atrium.",
    category: "Our Space",
    layout: "photoStandard",
    interaction: "staticImage",
  },
  {
    id: "video-aquarium-lounge",
    kind: "video",
    src: "/videos/office-lounge.mp4",
    poster: "/images/tour/office-lounge-poster.webp",
    alt: "Video of the lounge with a reef aquarium and leather chairs",
    title: "The Aquarium Lounge",
    description: "A quiet place to wait, with a reef aquarium and soft light.",
    category: "Our Space",
    layout: "videoWide",
    interaction: "tapToPlayLoopMuted",
    uploadDate: TOUR_CLIPS_DATE,
  },
  {
    id: "photo-lounge-courtyard-view",
    kind: "image",
    src: `${CLD}/v1762989226/Post-8_jmfidt.webp`,
    alt: "Seating area with a view through the glass walls into the garden courtyard",
    title: "A Quiet Corner",
    description: "Seating that looks out through the glass into the courtyard.",
    category: "Our Space",
    layout: "photoTall",
    interaction: "staticImage",
  },
  {
    id: "photo-hallway",
    kind: "image",
    src: "/images/redesign/office-hallway-glass.webp",
    alt: "Office hallway with glass walls and framed artwork",
    title: "Glass-Walled Hallway",
    description: "The hallway wraps around the courtyard, with framed artwork along the way.",
    category: "Our Space",
    layout: "photoStandard",
    interaction: "staticImage",
  },
  {
    id: "photo-hallway-art",
    kind: "image",
    src: `${CLD}/v1762989225/Post_e0ayi2.webp`,
    alt: "A large painting in a hallway with sliding glass doors",
    title: "Art in the Hallway",
    description: "A large painting near the treatment rooms.",
    category: "Our Space",
    layout: "photoTall",
    interaction: "staticImage",
  },
  {
    id: "video-office-exterior",
    kind: "video",
    src: "/videos/office-exterior.mp4",
    poster: "/images/tour/office-exterior-poster.webp",
    alt: "Video of the office entrance with the Christopher Wong D.D.S. sign and a sculpted pine",
    title: "Finding Us",
    description: "The entrance, marked by a sculpted pine and the practice sign.",
    category: "Our Space",
    layout: "videoWide",
    interaction: "tapToPlayLoopMuted",
    uploadDate: TOUR_CLIPS_DATE,
  },

  // --- PATIENT CARE ---
  {
    id: "photo-care-through-glass",
    kind: "image",
    src: "/images/redesign/care-through-glass-courtyard.webp",
    alt: "A clinician treating a patient in a glass-walled treatment room off the garden courtyard",
    title: "Care With a Garden View",
    description: "Treatment rooms look out onto the courtyard.",
    category: "Patient Care",
    layout: "photoStandard",
    interaction: "staticImage",
  },
  {
    id: "photo-dr-wong-treatment-room",
    kind: "image",
    src: `${CLD}/v1762989225/Post-2_hdbi3u.webp`,
    alt: "Dr. Christopher B. Wong standing in a treatment room beside the garden courtyard",
    title: "Ready for You",
    description: "Dr. Wong in one of the courtyard treatment rooms.",
    category: "Patient Care",
    layout: "photoTall",
    interaction: "staticImage",
  },
  {
    id: "photo-treatment-room",
    kind: "image",
    src: "/images/redesign/office-treatment-room.webp",
    alt: "Treatment room with a dental chair, monitor, and cabinetry",
    title: "A Treatment Room",
    description: "A treatment room with a chairside monitor.",
    category: "Patient Care",
    layout: "photoStandard",
    interaction: "staticImage",
  },

  // --- TECHNOLOGY ---
  {
    id: "photo-digital-scan",
    kind: "image",
    src: "/images/redesign/jamal-itero-scan.webp",
    alt: "Jamal, registered dental assistant, reviewing a digital scan on the iTero screen",
    title: "Digital Scans",
    description: "Jamal reviews a 3D digital scan on the iTero screen.",
    category: "Technology",
    layout: "photoStandard",
    interaction: "staticImage",
  },
  {
    id: "photo-operatory-courtyard",
    kind: "image",
    src: "/images/redesign/office-operatory-courtyard.webp",
    alt: "Treatment room equipment facing the courtyard, with Dr. Wong in the background",
    title: "Chairside Equipment",
    description: "Treatment-room equipment, with the courtyard just outside the glass.",
    category: "Technology",
    layout: "photoStandard",
    interaction: "staticImage",
  },

  // --- OUR TEAM ---
  {
    id: "photo-front-desk-laugh",
    kind: "image",
    src: "/images/redesign/dr-wong-front-desk-laughing.webp",
    alt: "Dr. Christopher B. Wong laughing with two team members at the front desk",
    title: "Front-Desk Laughs",
    description: "An unposed moment at the front desk.",
    category: "Our Team",
    layout: "photoStandard",
    interaction: "staticImage",
  },
  {
    id: "photo-dr-portrait",
    kind: "image",
    src: `${CLD}/v1762989226/Post-11_nohz6f.webp`,
    alt: "Dr. Christopher B. Wong in a white coat in the reception area",
    title: "Dr. Christopher B. Wong",
    description: "Dr. Wong in the reception area.",
    category: "Our Team",
    layout: "photoTall",
    interaction: "staticImage",
  },
  {
    id: "video-front-desk",
    kind: "video",
    src: "/videos/office-frontdesk.mp4",
    poster: "/images/tour/office-frontdesk-poster.webp",
    alt: "Video of a team member working at the front desk",
    title: "At the Front Desk",
    description: "Where the team checks you in, confirms visits, and answers insurance questions.",
    category: "Our Team",
    layout: "videoWide",
    interaction: "tapToPlayLoopMuted",
    uploadDate: TOUR_CLIPS_DATE,
  },
  {
    id: "photo-team-lounge",
    kind: "image",
    src: "/images/redesign/team-group-lounge.webp",
    alt: "Dr. Christopher B. Wong and the dental team in the office lounge, lit by the aquarium",
    title: "By the Aquarium",
    description: "The team in the lounge, beside the reef aquarium.",
    category: "Our Team",
    layout: "photoStandard",
    interaction: "staticImage",
  },
  {
    id: "photo-reception-conversation",
    kind: "image",
    src: "/images/redesign/dr-wong-reception-conversation.webp",
    alt: "Dr. Christopher B. Wong talking with two team members at the reception counter",
    title: "A Quick Huddle",
    description: "Dr. Wong catching up with the team at the reception counter.",
    category: "Our Team",
    layout: "photoStandard",
    interaction: "staticImage",
  },
  {
    id: "photo-team-shared-laugh",
    kind: "image",
    src: "/images/redesign/team-shared-laugh-treatment-room.webp",
    alt: "Two dental team members share a laugh while reviewing a chart in a treatment room",
    title: "Between Patients",
    description: "Two team members share a laugh over a chart.",
    category: "Our Team",
    layout: "photoStandard",
    interaction: "staticImage",
  },
  {
    id: "photo-clinic-team",
    kind: "image",
    src: `${CLD}/v1762989227/Polaroids_iep3fj.webp`,
    alt: "Two polaroid photos of Dr. Christopher B. Wong, one of them signed",
    title: "Dr. Wong’s Polaroids",
    description: "A pair of polaroids from the office: Dr. Wong in a white coat, and in a treatment room.",
    category: "Our Team",
    layout: "photoStandard",
    interaction: "staticImage",
  },
];
