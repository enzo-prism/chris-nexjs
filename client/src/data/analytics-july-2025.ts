// July 2025 Analytics Data for Dr. Christopher Wong DDS
export const julyAnalyticsData = {
  schema_version: 3,
  period: { 
    start: "2025-07-01", 
    end: "2025-07-31",
    lastUpdated: "2025-08-01"
  },
  
  // Executive Summary Metrics
  executive: {
    newUsers: 916,
    returningUsers: 127,
    activeUsers: 946,
    mobileShare: 62,
    avgSessionDuration: "4:35",
    pagesPerSession: 2.7,
    bounceRate: 39.9,
    summary: "Key drivers this month: direct & organic search; About/Team pages; Instagram assists. Conversions not yet tracked—instrumentation underway."
  },
  
  // Acquisition Data
  acquisition: {
    firstTimeUsers: {
      direct: 36.8,
      organic: 24.7,
      organicSocial: 19.7,
      paid: 15.1,
      other: 3.8
    },
    sessionsBySource: [
      { source: "Google", sessions: 402 },
      { source: "Instagram", sessions: 160 },
      { source: "LinkedIn", sessions: 51 },
      { source: "Yelp", sessions: 21 },
      { source: "YouTube", sessions: 21 },
      { source: "Bing", sessions: 13 }
    ],
    topCities: [
      "San Jose",
      "Mountain View", 
      "San Francisco",
      "Los Angeles",
      "Palo Alto",
      "Sunnyvale",
      "Redwood City"
    ]
  },
  
  // On-site Behavior & UX
  behavior: {
    metrics: {
      avgSessionDuration: "4:35",
      pagesPerSession: 2.7,
      bounceRate: 39.9,
      avgScrollDepth: 51
    },
    topPages: [
      { page: "Home", sessions: 74 },
      { page: "About", sessions: 64 },
      { page: "Contact", sessions: 24 },
      { page: "Services", sessions: 22 },
      { page: "Schedule", sessions: 22 }
    ],
    topClicks: [
      { element: "About", clicks: 41 },
      { element: "Meet Our Team", clicks: 24 },
      { element: "Contact", clicks: 23 },
      { element: "Book Appointment", clicks: 14 }
    ],
    friction: {
      rageClicks: 0,
      consoleWarnings: 3,
      note: "Minor console warning seen in 3 sessions"
    },
    insight: "Trust pages (About/Team) are the traffic magnets—add strong 'Call / Schedule' CTAs there, especially on mobile."
  },
  
  // Search Visibility
  searchVisibility: {
    landingPagesByImpressions: [
      { page: "/", impressions: 1500 },
      { page: "/our-services", impressions: 175 },
      { page: "/dr-kris-hamamoto", impressions: 137 },
      { page: "/?page_id=7", impressions: 70 },
      { page: "/dr-chris-wong", impressions: 36 },
      { page: "/about-us", impressions: 31 }
    ],
    queriesByClicks: [
      { query: "chris wong dds", clicks: 7 },
      { query: "christopher wong dds", clicks: 6 },
      { query: "kris hamamoto", clicks: 3 },
      { query: "dentist near me", clicks: 1 }
    ],
    insight: "Brand searches dominate. Next step: service + city pages to grow non-brand discovery."
  },
  
  // Conversions
  conversions: {
    qualifiedLeads: 0,
    convertedLeads: 0,
    status: "Action required",
    message: "Instrument GA4 events for form_submit, tel_click, book_appointment_click + scheduler completion. Add UTMs to social links."
  },
  
  // Reputation & Social Proof
  reputation: {
    july: {
      newReviewsCount: 1,
      platformBreakdown: { 
        google: 0, 
        yelp: 1 
      },
      avgRatingNew: 5.0,
      topQuotes: [
        {
          source: "Yelp",
          date: "2025-07-01",
          rating: 5,
          excerpt: "Been going… eight years… gentle and thorough.",
          fullQuote: "Been going to Dr. Wong for eight years. The hygienists are gentle and thorough."
        }
      ],
      themes: [
        "gentle",
        "thorough hygiene",
        "professional",
        "helpful staff",
        "reliable scheduling"
      ]
    },
    previewAug: {
      newReviewsCount: 2,
      platformBreakdown: { 
        google: 1, 
        yelp: 1 
      },
      quotes: [
        {
          source: "Yelp",
          date: "2025-08-02",
          rating: 5,
          excerpt: "Highly recommended… high standards and professionalism… staff helpful."
        },
        {
          source: "Google",
          date: "2025-08-02",
          rating: 5,
          excerpt: "Best dental in the area… decades."
        }
      ]
    },
    context: {
      quote: "Best dental in the area… decades.",
      source: "Google",
      date: "2024-06-24"
    },
    insight: "Reviews strongly reinforce the trust pages; surface 2–3 best quotes on About, Team & Schedule pages."
  },
  
  // Shipped This Month (Prism Highlights)
  highlights: [
    {
      date: "2025-07-10",
      title: "SEMrush analytics integrated",
      impact: "Improves SEO diagnostics & keyword tracking → faster fixes, better rankings.",
      evidence: [
        "Site Audit initialized",
        "Health score baseline captured",
        "Keyword tracking list created"
      ],
      status: "complete"
    },
    {
      date: "2025-07-15",
      title: "AI stack upgrade: Claude Opus 4.1 + GPT-5",
      impact: "Higher-quality copy, faster content outlines, smarter SEO briefs & on-site microcopy.",
      evidence: [
        "Content briefs for service pages",
        "On-page copy refresh proposals"
      ],
      status: "complete"
    },
    {
      date: "2025-07-18",
      title: "Hotjar rollout",
      impact: "Validates UX on mobile; pinpoints where to place CTAs for more bookings.",
      evidence: [
        "July heatmaps recorded",
        "Book CTA interactions (14 sessions) identified"
      ],
      status: "complete"
    },
    {
      date: "2025-07-25",
      title: "/analytics dashboard (this page) v1",
      impact: "Always-on visibility; reduces status emails; single source of truth.",
      evidence: [
        "Static latest.json snapshot",
        "Standardized layout for monthly updates"
      ],
      status: "complete"
    },
    {
      date: "2025-07-29",
      title: "Feno partnership",
      impact: "Potential referral channel / co-marketing (pipeline lift & LTV).",
      evidence: [
        "Introductions + partnership brief drafted"
      ],
      status: "in-progress",
      statusNote: "Negotiating terms"
    }
  ],
  
  // Targets for August
  targetsNextMonth: [
    {
      priority: 1,
      title: "Instrument conversions",
      description: "GA4 events for phone, form, booking; add UTMs to social links"
    },
    {
      priority: 2,
      title: "Mobile CTA upgrades",
      description: "Sticky call/schedule; mid-page CTAs on About/Team"
    },
    {
      priority: 3,
      title: "Local SEO build",
      description: "Publish 1–2 Service + City pages (e.g., 'Dental Implants in Palo Alto')"
    },
    {
      priority: 4,
      title: "Review flywheel",
      description: "Add in-office QR + thank-you SMS template; track new/month"
    },
    {
      priority: 5,
      title: "Hotjar funnel",
      description: "Home → About/Team → Schedule → Thank-you; add 1-question exit poll on Schedule"
    }
  ],
  
  // Stack Information
  stack: {
    analytics: ["GA4", "GSC", "Hotjar", "SEMrush"],
    aiModels: ["Claude Opus 4.1", "GPT-5"],
    notes: "Models used for briefs, copy suggestions, insights."
  }
};