import { drWongImages } from "@/lib/imageUrls";

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
  interaction: "heroAutoplayMuted" | "tapToPlayLoopMuted" | "staticImage";
};

export const heroVideo: GalleryMediaItem = {
  id: "hero-clinic-overview",
  kind: "video",
  src: "https://res.cloudinary.com/dhqpqfw6w/video/upload/v1772057711/chris_wong_dds_lgbxf4.mp4",
  poster: drWongImages.heroImage,
  alt: "Dr. Christopher B. Wong dental office highlights video",
  title: "Clinic highlights",
  description: "Experience the calming and modern environment of our Palo Alto practice.",
  category: "Our Space",
  layout: "videoWide",
  interaction: "heroAutoplayMuted",
};

export const galleryItems: readonly GalleryMediaItem[] = [
  // --- OUR SPACE ---
  {
    id: "photo-reception-area",
    kind: "image",
    src: drWongImages.drWongOffice1,
    alt: "Warm reception area with Dr. Wong",
    title: "A Warm Welcome",
    description: "Our reception area is designed to feel more like a home than a clinic.",
    category: "Our Space",
    layout: "photoStandard",
    interaction: "staticImage",
  },
  {
    id: "video-office-walkthrough",
    kind: "video",
    src: "https://res.cloudinary.com/dhqpqfw6w/video/upload/v1772057719/dr-wong-office-2-10s-b3-varA_gaole9.mp4",
    poster: drWongImages.drWongOffice2,
    alt: "Office walkthrough video clip showing natural light",
    title: "Light-Filled Spaces",
    description: "We prioritize natural light and open spaces for a relaxing patient experience.",
    category: "Our Space",
    layout: "videoWide",
    interaction: "tapToPlayLoopMuted",
  },
  {
    id: "photo-courtyard-view",
    kind: "image",
    src: drWongImages.drWongOffice2,
    alt: "Garden courtyard view from dental suite",
    title: "Serene Courtyard",
    description: "Every operatory features a calming view of our private garden courtyard.",
    category: "Our Space",
    layout: "photoTall",
    interaction: "staticImage",
  },
  {
    id: "photo-front-entrance",
    kind: "image",
    src: drWongImages.drWongReception,
    alt: "Dr. Wong's office front entrance",
    title: "Easy Access",
    description: "Conveniently located in the heart of Palo Alto with accessible parking.",
    category: "Our Space",
    layout: "photoStandard",
    interaction: "staticImage",
  },

  // --- PATIENT CARE ---
  {
    id: "photo-treatment-room",
    kind: "image",
    src: drWongImages.drWongWaiting,
    alt: "Modern treatment room with comfortable patient chair",
    title: "Comfort-First Care",
    description: "State-of-the-art treatment suites designed for maximum patient comfort.",
    category: "Patient Care",
    layout: "photoStandard",
    interaction: "staticImage",
  },
  {
    id: "video-treatment-spaces",
    kind: "video",
    src: "https://res.cloudinary.com/dhqpqfw6w/video/upload/v1772057713/Untitled_2_vte679.mp4",
    poster: drWongImages.drWongWaiting,
    alt: "Video of treatment setup and environment",
    title: "Ready for You",
    description: "A behind-the-scenes look at how we prepare for each patient.",
    category: "Patient Care",
    layout: "videoWide",
    interaction: "tapToPlayLoopMuted",
  },
  {
    id: "photo-consultation-room",
    kind: "image",
    src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1765382511/IMG_8352_qyutwv.webp",
    alt: "Private consultation room for treatment planning",
    title: "Private Consultations",
    description: "Dedicated spaces to discuss your treatment goals in privacy and comfort.",
    category: "Patient Care",
    layout: "photoTall",
    interaction: "staticImage",
  },

  // --- TECHNOLOGY ---
  {
    id: "photo-clinical-equipment",
    kind: "image",
    src: drWongImages.drWongLab2,
    alt: "Advanced dental technology and clinical equipment",
    title: "Modern Technology",
    description: "We invest in the latest dental tech to ensure precision and better outcomes.",
    category: "Technology",
    layout: "photoStandard",
    interaction: "staticImage",
  },
  {
    id: "photo-dental-environment",
    kind: "image",
    src: drWongImages.drWongLab1,
    alt: "Historical photos and dental decor",
    title: "Legacy of Excellence",
    description: "Blending modern technology with a long-standing commitment to the Palo Alto community.",
    category: "Technology",
    layout: "photoTall",
    interaction: "staticImage",
  },
  {
    id: "video-clinic-overview",
    kind: "video",
    src: "https://res.cloudinary.com/dhqpqfw6w/video/upload/v1772057700/dr-wong-office-1-10s_axqa3o.mp4",
    poster: drWongImages.drWongReception,
    alt: "Video overview of office flow and tech integration",
    title: "Seamless Integration",
    description: "Advanced systems working together to provide a smooth, efficient visit.",
    category: "Technology",
    layout: "videoWide",
    interaction: "tapToPlayLoopMuted",
  },

  // --- OUR TEAM ---
  {
    id: "photo-dr-portrait",
    kind: "image",
    src: drWongImages.polaroid,
    alt: "Dr. Christopher B. Wong",
    title: "Dr. Christopher Wong",
    description: "Meet the expert behind the care, dedicated to your dental health since 1994.",
    category: "Our Team",
    layout: "photoTall",
    interaction: "staticImage",
  },
  {
    id: "photo-clinic-team",
    kind: "image",
    src: drWongImages.teamPhoto,
    alt: "Our friendly dental team",
    title: "Our Dedicated Team",
    description: "Our experienced team is here to support you at every step of your journey.",
    category: "Our Team",
    layout: "photoStandard",
    interaction: "staticImage",
  },
  {
    id: "video-doctor-team",
    kind: "video",
    src: "https://res.cloudinary.com/dhqpqfw6w/video/upload/v1772057535/chris_wong_dds_cfagg4.mp4",
    poster: drWongImages.teamPhoto,
    alt: "Dr. Wong and team working together",
    title: "Collaborative Care",
    description: "Our team works in harmony to provide comprehensive dental solutions.",
    category: "Our Team",
    layout: "videoWide",
    interaction: "tapToPlayLoopMuted",
  },
];

