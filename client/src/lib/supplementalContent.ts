import { officeInfo } from "@/lib/data";

export type SupplementalBlock = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

const officeAddress = `${officeInfo.address.line1}, ${officeInfo.address.line2}`;

export const supplementalContentByPath: Record<string, SupplementalBlock[]> = {
  "/": [
    {
      heading: "A clear, local approach to dental care in Palo Alto",
      paragraphs: [
        "Patients come to our Palo Alto office for more than a quick cleaning. We take time to understand goals, review health history, and explain what we see so you can make confident decisions.",
        "Whether you need routine preventive care, Invisalign, or help with a broken tooth, we focus on conservative solutions and long-term comfort. Our team welcomes patients from Palo Alto, Menlo Park, Stanford, and nearby neighborhoods.",
      ],
      bullets: [
        "Preventive exams and cleanings with risk-based intervals",
        "Cosmetic options like whitening, veneers, and Invisalign",
        "Restorative care for cracks, cavities, and worn teeth",
        "Same-day priority slots for urgent dental concerns when available",
      ],
    },
  ],
  "/about": [
    {
      heading: "Meet Dr. Christopher B. Wong and the team",
      paragraphs: [
        "Dr. Wong combines decades of clinical experience with a calm, detail-focused approach. He explains findings in plain language and outlines options so patients can choose the level of care that fits their goals.",
        "Continuing education and modern tools like digital imaging help the team plan precise, conservative treatment. The practice serves generations of families across Palo Alto and the Peninsula.",
      ],
      bullets: [
        "Emphasis on comfort, prevention, and clear communication",
        "Care plans tailored to each patient, not a one-size-fits-all template",
        "A trusted local team for families, professionals, and students",
      ],
    },
  ],
  "/blog": [
    {
      heading: "Dental guidance you can use",
      paragraphs: [
        "Our blog answers real questions we hear from Palo Alto patients about Invisalign, whitening, emergency care, and family dentistry. Each article is written to be practical and easy to apply.",
        "Use the search and categories to find what you need, then bring questions to your visit. If you have sudden pain or swelling, contact our office for guidance instead of waiting.",
      ],
      bullets: [
        "Start with the featured article for quick tips",
        "Browse by category to match your goals",
        "Schedule a visit to personalize any advice",
      ],
    },
  ],
  "/services": [
    {
      heading: "Choosing the right service starts with an exam",
      paragraphs: [
        "We begin with a comprehensive exam and digital imaging to understand your teeth, gums, and bite. From there we map out options and explain timing, cost, and expected results.",
        "Some care happens in phases. Preventive visits create a healthy foundation, then cosmetic or restorative work can follow when you are ready. We help you prioritize what will make the biggest impact.",
      ],
      bullets: [
        "Preventive care to keep problems small",
        "Cosmetic options to improve your smile",
        "Restorative solutions that protect function",
        "Emergency visits for unexpected pain or damage",
      ],
    },
  ],
  "/preventive-dentistry": [
    {
      heading: "Preventive care that fits your risk level",
      paragraphs: [
        "Your preventive plan is based on your history, gum health, and lifestyle. Some patients stay on a six-month schedule, while others benefit from more frequent visits.",
        "Cleanings, exams, and digital X-rays help us spot early changes so treatment stays simple and affordable.",
      ],
      bullets: [
        "Detailed exams and gum screenings",
        "Digital X-rays when needed",
        "Personalized home care coaching",
        "Fluoride or sealants when appropriate",
      ],
    },
  ],
  "/restorative-dentistry": [
    {
      heading: "Restore strength, comfort, and function",
      paragraphs: [
        "Restorative dentistry treats cracked, decayed, or missing teeth so you can chew and smile comfortably. We focus on preserving healthy structure and keeping your bite stable.",
        "Treatment can include composite fillings, crowns, bridges, or implants. We explain materials, timelines, and how to care for restorations so they last.",
      ],
      bullets: [
        "Tooth-colored fillings for small to moderate decay",
        "Crowns that protect weakened teeth",
        "Implant planning for missing teeth",
      ],
    },
  ],
  "/pediatric-dentist-palo-alto": [
    {
      heading: "Gentle pediatric dentistry in Palo Alto",
      paragraphs: [
        "Kids do best when visits are calm and predictable. We use age-appropriate language, short explanations, and positive reinforcement to build trust.",
        "Parents receive practical guidance on brushing, diet, and cavity prevention so routines at home feel manageable.",
      ],
      bullets: [
        "First visit guidance and growth monitoring",
        "Sealants and fluoride when appropriate",
        "Comfort first care for anxious kids",
      ],
    },
  ],
  "/dentist-menlo-park": [
    {
      heading: "Convenient care for Menlo Park families",
      paragraphs: [
        "Our Palo Alto office is a short drive from Menlo Park, with easy access from Sand Hill Road and University Avenue. Many families choose us for consistent, long-term care even if their home address is in Menlo Park.",
        "We can coordinate appointments for parents and kids to reduce trips, and our team shares arrival and parking guidance when you book.",
      ],
      bullets: [
        "Family scheduling support",
        "Easy access to Palo Alto and Stanford",
        "Clear estimates before treatment",
      ],
    },
  ],
  "/dentist-mountain-view": [
    {
      heading: "Dental care near Mountain View",
      paragraphs: [
        "Mountain View patients visit our Palo Alto office for preventive cleanings, Invisalign, and restorative care. We focus on conservative treatment plans and clear explanations so you know what to expect.",
        "If you are coming from Mountain View, we will share the easiest route and parking tips before your visit. Many patients schedule checkups on the same day as work or school commitments in the Peninsula.",
      ],
      bullets: [
        "Preventive care, Invisalign, and cosmetic options",
        "Family-friendly visits for kids and teens",
        "Same-day emergency slots when available",
      ],
    },
  ],
  "/dentist-los-altos": [
    {
      heading: "Personalized care for Los Altos patients",
      paragraphs: [
        "Los Altos patients choose our nearby Palo Alto dental office for attentive care and long-term planning. We review your goals, explain options, and focus on protecting healthy tooth structure.",
        `Our office is located at ${officeAddress}, and we can share arrival tips and parking guidance when you schedule.`,
      ],
      bullets: [
        "Preventive checkups and cleanings",
        "Cosmetic care like whitening and veneers",
        "Restorative dentistry with clear next steps",
      ],
    },
  ],
  "/dentist-los-altos-hills": [
    {
      heading: "Dental care near Los Altos Hills",
      paragraphs: [
        "Los Altos Hills patients visit our Palo Alto office for preventive cleanings, Invisalign, cosmetic dentistry, and restorative care. We focus on conservative treatment plans and clear explanations so you know what to expect.",
        `Our office is located at ${officeAddress}, and we can share arrival tips and parking guidance when you schedule.`,
      ],
      bullets: [
        "Preventive exams and cleanings",
        "Cosmetic options like whitening and veneers",
        "Same-day emergency visits when available",
      ],
    },
  ],
  "/dentist-sunnyvale": [
    {
      heading: "Care for Sunnyvale families",
      paragraphs: [
        "Sunnyvale patients choose our Palo Alto dental office for consistent, family-friendly care. We prioritize prevention and help you plan next steps with clarity and comfort in mind.",
        "From cleanings and fillings to Invisalign and cosmetic options, we tailor recommendations to fit your goals and schedule.",
      ],
      bullets: [
        "Family dentistry for kids through seniors",
        "Clear Invisalign planning and follow-up",
        "Restorative solutions that protect function",
      ],
    },
  ],
  "/dentist-cupertino": [
    {
      heading: "Care for Cupertino families",
      paragraphs: [
        "Cupertino patients choose our Palo Alto dental office for consistent, family-friendly care. We prioritize prevention and help you plan next steps with clarity and comfort in mind.",
        "From cleanings and fillings to Invisalign and cosmetic options, we tailor recommendations to fit your goals and schedule.",
      ],
      bullets: [
        "Family dentistry for kids through seniors",
        "Clear Invisalign planning and follow-up",
        "Restorative solutions that protect function",
      ],
    },
  ],
  "/dentist-redwood-city": [
    {
      heading: "Care for Redwood City families",
      paragraphs: [
        "Redwood City patients visit our Palo Alto office for preventive cleanings, restorative care, and cosmetic dentistry. We focus on conservative treatment plans and clear explanations so you know what to expect.",
        "If you are coming from Redwood City, we will share the easiest route and parking tips before your visit.",
      ],
      bullets: [
        "Preventive care and digital exams",
        "Cosmetic options like whitening and veneers",
        "Same-day emergency slots when available",
      ],
    },
  ],
  "/dentist-atherton": [
    {
      heading: "Care for Atherton families",
      paragraphs: [
        "Atherton patients choose our Palo Alto dental office for consistent, family-friendly care. We prioritize prevention and help you plan next steps with clarity and comfort in mind.",
        "From cleanings and fillings to Invisalign and cosmetic options, we tailor recommendations to fit your goals and schedule.",
      ],
      bullets: [
        "Family dentistry for kids through seniors",
        "Clear Invisalign planning and follow-up",
        "Restorative solutions that protect function",
      ],
    },
  ],
  "/dentist-redwood-shores": [
    {
      heading: "Care for Redwood Shores families",
      paragraphs: [
        "Redwood Shores patients visit our Palo Alto office for preventive cleanings, restorative care, and cosmetic dentistry. We focus on conservative treatment plans and clear explanations so you know what to expect.",
        "If you are coming from Redwood Shores, we will share the easiest route and parking tips before your visit.",
      ],
      bullets: [
        "Preventive care and digital exams",
        "Cosmetic options like whitening and veneers",
        "Same-day emergency slots when available",
      ],
    },
  ],
  "/locations": [
    {
      heading: "Locations served from our Palo Alto office",
      paragraphs: [
        "Our Palo Alto dental office welcomes patients from across the Peninsula. Use this page to find the city closest to you, then explore location-specific FAQs and service highlights.",
        "All appointments take place at our Palo Alto office, and we will share parking tips and arrival guidance when you schedule.",
      ],
      bullets: [
        "Family dentistry and Invisalign for nearby cities",
        "Emergency care when urgent issues arise",
        "Clear estimates and treatment planning",
      ],
    },
  ],
  "/emergency-dental": [
    {
      heading: "How we handle dental emergencies",
      paragraphs: [
        "If you have a severe toothache, swelling, or a broken tooth, call our office as soon as possible. We reserve time for urgent visits and will guide you on next steps.",
        "Quick evaluation helps us relieve pain and protect the tooth. When you arrive, we focus on diagnosis first, then discuss treatment options and timing.",
      ],
      bullets: [
        "Same-day visits offered when schedules allow",
        "Clear instructions for after hours care",
        "Focus on pain relief and tooth preservation",
      ],
    },
  ],
  "/invisalign/resources": [
    {
      heading: "Making the most of Invisalign",
      paragraphs: [
        "This resource hub covers the details that keep Invisalign on track, from wear time and aligner care to attachments and refinements.",
        "If you are considering Invisalign in Palo Alto, a consultation and digital scan are the best way to confirm timelines and costs.",
        "We also cover attachments, refinements, and retainer options so you know what happens after the last tray.",
      ],
      bullets: [
        "Wear aligners 20 to 22 hours each day",
        "Clean trays gently and avoid hot water",
        "Plan for retainers after treatment",
      ],
    },
  ],
  "/dental-veneers": [
    {
      heading: "Veneers that look natural and feel balanced",
      paragraphs: [
        "Veneers are customized to match your facial features, bite, and smile goals. We evaluate enamel, gum health, and existing restorations to decide if veneers are the right fit.",
        "Long-term results depend on good home care and regular cleanings. We also discuss alternatives like whitening or bonding when they can deliver the result you want with less tooth reduction.",
      ],
      bullets: [
        "Porcelain or composite veneer options",
        "Smile design that respects natural tooth shape",
        "Clear aftercare guidance for durability",
      ],
    },
  ],
  "/teeth-whitening-palo-alto": [
    {
      heading: "Whitening that protects your enamel",
      paragraphs: [
        "Professional whitening is tailored to your shade goals and sensitivity history. We compare in-office options with custom take-home trays so you can choose the pace that feels right.",
        "If you have crowns or veneers, we will review how whitening affects them and how to plan for a consistent shade.",
      ],
      bullets: [
        "In-office whitening for fast changes",
        "Take-home trays for gradual brightening",
        "Maintenance plans to keep results longer",
      ],
    },
  ],
  "/zoom-whitening": [
    {
      heading: "What to expect with ZOOM whitening",
      paragraphs: [
        "ZOOM whitening is an in-office treatment that lifts stains in one visit. We protect your gums, apply whitening gel in timed sessions, and check your shade between rounds.",
        "Mild sensitivity is common but temporary. We share ways to stay comfortable and maintain your results at home.",
      ],
      bullets: [
        "Single visit whitening session",
        "Gum protection and comfort measures",
        "Post treatment care tips",
      ],
    },
  ],
  "/dental-cleaning-palo-alto": [
    {
      heading: "Cleanings that support long-term oral health",
      paragraphs: [
        "Professional cleanings remove plaque and tartar from areas that brushing cannot reach. Your visit also includes gum screening and a dental exam to catch early issues.",
        "We adjust cleaning frequency based on your history, not a one-size-fits-all schedule.",
      ],
      bullets: [
        "Plaque and tartar removal",
        "Gum health checks",
        "Personalized home care tips",
      ],
    },
  ],
  "/cavity-fillings-palo-alto": [
    {
      heading: "Tooth-colored fillings that blend naturally",
      paragraphs: [
        "Composite fillings repair cavities while preserving healthy tooth structure. We remove decay, shape the area, and match the shade for a natural look.",
        "After treatment, mild sensitivity can occur for a short time. We will review bite comfort and aftercare so the tooth feels normal quickly.",
      ],
      bullets: [
        "Conservative removal of decay",
        "Shade matched composite material",
        "Bite adjustments for comfort",
      ],
    },
  ],
  "/crowns-palo-alto": [
    {
      heading: "Crowns that protect and strengthen teeth",
      paragraphs: [
        "Crowns cover cracked, heavily filled, or weakened teeth to restore function. We evaluate the tooth, design the crown, and confirm the fit so your bite stays balanced.",
        "With good hygiene and regular checkups, crowns can last many years. We will review care tips and how to protect your crown from heavy grinding.",
      ],
      bullets: [
        "Digital impressions for precise fit",
        "Material options based on location and goals",
        "Long-term maintenance guidance",
      ],
    },
  ],
  "/contact": [
    {
      heading: "The best way to reach our Palo Alto office",
      paragraphs: [
        "You can call, email, or use the contact form to request a visit. Our team responds during business hours and will help you find the right appointment type.",
        "If you are dealing with pain or swelling, call so we can guide you on next steps and look for an urgent slot.",
        "Messages sent after hours are returned the next business day. For urgent issues, phone calls are the fastest way to reach us.",
      ],
      bullets: [
        "Reason for visit and any symptoms",
        "Insurance details if applicable",
        "Preferred days and times",
      ],
    },
    {
      heading: "Location and arrival tips",
      paragraphs: [
        `Our office is located at ${officeAddress}, close to Stanford and downtown Palo Alto.`,
        "If you are new to the area, ask about parking and the easiest route based on your starting point. Arriving a few minutes early helps with check-in and paperwork.",
      ],
    },
  ],
  "/schedule": [
    {
      heading: "Preparing for your appointment",
      paragraphs: [
        "Scheduling is easiest when you know your goals and availability. Our team can verify insurance, review any urgent concerns, and reserve the right appointment length.",
        "Bring a photo ID, insurance information, and a list of medications or health conditions. If you have recent X-rays, let us know so we can request them.",
        "Let us know if you need help with records transfer or have specific scheduling constraints so we can plan the right length of visit.",
      ],
      bullets: [
        "Best phone number and email",
        "Preferred days and times",
        "Any dental anxiety or sensitivity",
      ],
    },
    {
      heading: "Tips for a smooth first visit",
      paragraphs: [
        "A first visit typically includes a comprehensive exam, digital X-rays when needed, and a discussion of next steps. We focus on clarity so you know what matters most right away.",
        "If you need to reschedule, please call as early as possible so we can offer the time to another patient.",
        "If you are scheduling for multiple family members, share their names and preferred sequence so we can coordinate back-to-back times.",
      ],
    },
  ],
  "/patient-resources": [
    {
      heading: "Resources to make visits simple",
      paragraphs: [
        "Patient forms, insurance guidance, and first visit details are gathered here to save time on the day of your appointment. Completing forms ahead of time helps us focus on your care.",
        "If you are unsure which form to complete, contact our team and we will point you to the right resource.",
        "We can also verify insurance benefits ahead of time so you have a clear estimate before treatment.",
      ],
      bullets: [
        "New patient paperwork",
        "Insurance and payment details",
        "FAQs about visits and procedures",
        "First visit overview",
      ],
    },
    {
      heading: "Records, privacy, and coordination",
      paragraphs: [
        "We can help transfer records from a previous dentist and coordinate with specialists when needed. Your information is handled under HIPAA privacy guidelines.",
        "If you need copies of records for school, work, or another provider, let us know and we will outline the process.",
      ],
    },
  ],
  "/patient-stories": [
    {
      heading: "Stories that highlight real outcomes",
      paragraphs: [
        "Patient stories focus on goals, the treatment journey, and the results that matter most to each person. We share these experiences with respect for privacy and consent.",
        "Every smile is different, so your plan will be built around your health history and priorities.",
      ],
      bullets: [
        "Cosmetic updates for confidence",
        "Restorative care after damage",
        "Preventive routines for long-term health",
      ],
    },
    {
      heading: "What these stories can help you decide",
      paragraphs: [
        "Stories can help you understand timelines, what visits feel like, and how different services can work together.",
        "Use them as a starting point, then ask questions during your consultation so we can tailor a plan for you.",
      ],
    },
  ],
  "/testimonials": [
    {
      heading: "What patients mention most",
      paragraphs: [
        "Reviews often highlight gentle care, clear explanations, and a team that respects your time. Many patients also mention comfort-focused visits and conservative recommendations.",
        "We take feedback seriously and use it to keep improving the patient experience.",
        "You will see feedback from preventive visits, cosmetic care, and emergency appointments, which helps set expectations for different types of visits.",
      ],
      bullets: [
        "Kind, clear communication",
        "Comfort during cleanings and procedures",
        "Helpful guidance on insurance and costs",
      ],
    },
    {
      heading: "How we gather feedback",
      paragraphs: [
        "Patients share reviews through Google, in-office surveys, and follow-up messages. We never edit feedback, but we do look for trends that can improve our service.",
        "If you would like to share your experience, we welcome both positive notes and suggestions.",
      ],
    },
  ],
};
