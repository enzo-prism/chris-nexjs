export const officeInfo = {
  name: "Christopher B. Wong, DDS",
  phoneE164: "+16503266319",
  address: {
    line1: "409 Cambridge Ave",
    line2: "Palo Alto, CA 94306",
    city: "Palo Alto",
    region: "CA",
    postalCode: "94306",
    country: "US",
  },
  mapUrl: "https://maps.app.goo.gl/UCTqQ1fZsdMq7vma9",
  hours: {
    monday: "8:00 AM - 5:00 PM",
    tuesday: "8:00 AM - 5:00 PM",
    wednesday: "8:00 AM - 3:00 PM",
    thursday: "8:00 AM - 5:00 PM",
    friday: "8:00 AM - 4:00 PM",
    saturday: "Closed",
    sunday: "Closed",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Thursday"],
      opens: "08:00",
      closes: "17:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Wednesday",
      opens: "08:00",
      closes: "15:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "08:00",
      closes: "16:00",
    },
  ],
  specialOpeningHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "00:00",
      closes: "00:00",
      validFrom: "2026-06-19",
      validThrough: "2026-06-19",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "00:00",
      closes: "00:00",
      validFrom: "2026-07-03",
      validThrough: "2026-07-03",
    },
  ],
  phone: "(650) 326-6319",
  email: "chrisbwongdds@gmail.com",
  socialMedia: {
    facebook: "https://facebook.com/drwongdental",
    twitter: "https://twitter.com/drwongdental",
    instagram: "https://www.instagram.com/dr_wong_paloalto/",
    linkedin: "https://linkedin.com/in/drchristopherwong",
  },
} as const;

export type OfficeInfo = typeof officeInfo;

export const holidayHours = {
  active: true,
  id: "office-hours-2026-06-19-2026-07-03-holiday-limited-hours",
  title: "Temporary schedule update: June 19, June 24-26, and July 3, 2026",
  description:
    "The office will be closed Friday, June 19, 2026 for Juneteenth, have limited office hours Wednesday, June 24 through Friday, June 26, and be closed Friday, July 3, 2026 for the July Fourth holiday. Please call before visiting if you need to confirm availability or request an appointment.",
  shortNotice:
    "The office will be closed Friday, June 19 and Friday, July 3, with limited office hours Wednesday, June 24 through Friday, June 26.",
  footerNote:
    "Regular weekly hours apply outside these temporary schedule updates.",
  entries: [
    {
      day: "Fri, Jun 19",
      hours: "Closed",
      status: "closed",
      badge: "Juneteenth",
    },
    {
      day: "Wed-Fri, Jun 24-26",
      hours: "Limited hours",
      status: "varies",
      badge: "Call to confirm",
    },
    {
      day: "Fri, Jul 3",
      hours: "Closed",
      status: "closed",
      badge: "July Fourth holiday",
    },
  ],
  cta: {
    label: "Call to confirm availability",
    href: `tel:${officeInfo.phoneE164}`,
  },
} as const;
