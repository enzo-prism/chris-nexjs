import { officeInfo } from "@/lib/data";

export type SupplementalBlock = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

const officeAddress = `${officeInfo.address.line1}, ${officeInfo.address.line2}`;

export const supplementalContentByPath: Record<string, SupplementalBlock[]> = {
  "/contact": [
    {
      heading: "The best way to reach our Palo Alto office",
      paragraphs: [
        "You can call, email, or use the contact form to request a visit. Our team responds during business hours and will help you find the right appointment type.",
        "If you are dealing with pain or swelling, call so we can guide you on next steps and look for an urgent slot.",
        "Messages sent after hours are returned the next business day. For urgent issues, phone calls are the fastest way to reach us.",
      ],
      bullets: [
        "The type of visit you need (no health details by email or the form; share those by phone)",
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
  "/patient-resources": [
    {
      heading: "Records, privacy, and coordination",
      paragraphs: [
        "We can help transfer records from a previous dentist and coordinate with specialists when needed. Your information is handled under HIPAA privacy guidelines.",
        "If you need copies of records for school, work, or another provider, let us know and we will outline the process.",
      ],
    },
  ],
};
