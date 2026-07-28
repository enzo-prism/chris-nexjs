# API Contracts and Lead-Delivery Safety

Runtime contract for public API handlers. API tests must mock outbound vendors;
automated QA must never create a real patient lead.

## Read endpoints

- `GET /api/services`
- `GET /api/services/:slug`
- `GET /api/blog-posts`
- `GET /api/blog-posts?service=<service-slug>`
- `GET /api/blog-posts/:slug`
- `GET /api/testimonials`
- `GET /api/search?query=<term>`
- `GET /rss.xml`
- `GET /api/rss.xml`

There is no public lead-listing endpoint. In particular, `/api/appointments`
and a public contact-message listing must remain unavailable.

## Write endpoints

- `POST /api/contact`
- `POST /api/newsletter`
- `POST /api/schedule-request`

All write endpoints require `Content-Type: application/json`. Unsupported media
types return `415`. An invalid `Content-Length` returns `400`; an advertised body
larger than the endpoint limit returns `413`.

Body limits:

- contact and scheduling: `32 KiB`
- newsletter: `8 KiB`

A body that is not parseable JSON returns `400` with a fixed message; it must
never surface the parser's own error text. Schema or field validation failures
return `400`. Unexpected delivery or server failures return `500` without
exposing secrets or full vendor response bodies — the raw error is logged
server-side and the patient sees a fixed, actionable line, because the
scheduling form renders the returned `message` verbatim.

`POST /api/schedule-request` accepts both the current (v2) funnel payload and
the legacy schedule-page payload. When a submission carries any v2-only key
(`schedulingMode`, `isEmergency`, `contactPreference`) its validation errors are
reported against the v2 schema; the legacy schema is only tried for bodies that
carry no v2 signal. Without that split, a v2 submission with one bad field is
re-parsed as legacy and the patient is told that fields the form never had
(`emergency`, `preferredTimeOfDay`) are missing. The legacy schema allows 1–5
`preferredDays` while v2 caps the field at 3, so the legacy→v2 conversion trims
to the first three days — a valid legacy submission must never 400 on the
stricter v2 re-parse.

`POST /api/newsletter` validates `email` as a real address, caps it at 254
characters, and normalizes it (trim + lowercase) before the duplicate check.
The column's `UNIQUE` index is case-sensitive, so without normalization
`A@x.com` and `a@x.com` both store as separate subscribers.

## Delivery behavior

Contact, scheduling, and newsletter requests use Formspree as the primary
office-inbox delivery path. Each outbound request has an eight-second timeout.
A request is not reported as successful until the primary inbox delivery
succeeds. Newsletter delivery was storage-only until July 27, 2026 — on
serverless, storage without `DATABASE_URL` is a per-lambda in-memory fallback,
so signups could return `201` and vanish; the inbox post
(`form_key: "newsletter_signup"`) is what makes the endpoint durable.

Contact and newsletter database persistence is best effort after inbox
delivery, as is the newsletter duplicate check (on memory storage it only
dedupes within one lambda instance — Formspree receives every signup either
way). Optional
scheduling CRM and Slack forwarding also runs after inbox delivery and has an
eight-second timeout per destination; those optional failures are returned as
forwarding status and do not turn a delivered inbox request into a patient-facing
failure.

Honeypot-triggered contact, newsletter, and scheduling requests return a quiet
`201` but are not sent to the office, stored, or tracked as conversions. All
three use the same decoy field (`company`, exported as `HONEYPOT_FIELD`), and
each form renders a matching off-screen input — the server check only catches
bots if the field exists in the DOM for them to fill.

## Privacy and logging

- Never send names, email addresses, phone numbers, free-text messages, insurance
  details, or appointment notes to analytics.
- Never log request bodies or patient details.
- Keep analytics payloads limited to route, form, workflow, and coarse conversion
  context.
- Keep vendor endpoints and credentials server-side unless an endpoint is
  intentionally public by design.

## Verification

```bash
pnpm run test:api
pnpm run test:routes
```

The contract suite mocks outbound Formspree, CRM, and Slack calls. Do not verify
production by submitting a fake patient request without explicit approval.

Current limitations:

- Request policy is per-request validation; the app does not yet provide a
  shared distributed rate limiter across serverless instances.
- `POST /api/newsletter` is live and delivers to the office inbox, but
  `NewsletterForm` is not mounted on any page — the endpoint currently has no
  UI in front of it.
  Either wire the form into a surface (the footer is the natural home) or retire
  the endpoint; leaving an unreferenced write endpoint exposed is the worst of
  the three options.
- `GET /api/search` sets a public `s-maxage`, so each distinct `query` string is
  a separate CDN cache key and the query length is unbounded.
