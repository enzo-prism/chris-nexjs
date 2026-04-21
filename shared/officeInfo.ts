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
    wednesday: "8:00 AM - 5:00 PM",
    thursday: "8:00 AM - 5:00 PM",
    friday: "8:00 AM - 2:00 PM",
    saturday: "Closed",
    sunday: "Closed",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "08:00",
      closes: "17:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "08:00",
      closes: "14:00",
    },
  ],
  specialOpeningHoursSpecification: [],
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
  active: false,
  id: "office-hours-2026-04-06-through-2026-04-17",
  title: "Temporary schedule update: April 6 to April 17, 2026",
  description:
    "Dr. Wong will be out of the office during this stretch, so appointment availability and office hours may vary. The office will be fully closed Thursday, April 9, 2026 and Friday, April 10, 2026. Please call before visiting if you need to confirm availability or request the soonest appointment.",
  shortNotice:
    "Dr. Wong will be out from April 6 to April 17, 2026. Availability may vary, and the office will be closed Thursday, April 9 and Friday, April 10. Please call to confirm before visiting.",
  footerNote:
    "Outside April 6 to April 17, 2026, regular weekly hours apply.",
  entries: [
    {
      day: "Mon, Apr 6 to Wed, Apr 8",
      hours: "Hours may vary",
      status: "varies",
      badge: "Call to confirm",
    },
    {
      day: "Thu, Apr 9",
      hours: "Closed",
      status: "closed",
    },
    {
      day: "Fri, Apr 10",
      hours: "Closed",
      status: "closed",
    },
    {
      day: "Mon, Apr 13 to Fri, Apr 17",
      hours: "Hours may vary",
      status: "varies",
      badge: "Limited availability",
    },
  ],
  cta: {
    label: "Call to confirm availability",
    href: `tel:${officeInfo.phoneE164}`,
  },
} as const;
