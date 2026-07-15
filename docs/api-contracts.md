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

Schema or field validation failures return `400`. Unexpected delivery or server
failures return `500` without exposing secrets or full vendor response bodies.

## Delivery behavior

Contact and scheduling requests use Formspree as the primary office-inbox
delivery path. Each outbound request has an eight-second timeout. A contact or
scheduling request is not reported as successful until the primary inbox
delivery succeeds.

Contact database persistence is best effort after inbox delivery. Optional
scheduling CRM and Slack forwarding also runs after inbox delivery and has an
eight-second timeout per destination; those optional failures are returned as
forwarding status and do not turn a delivered inbox request into a patient-facing
failure.

Honeypot-triggered contact and scheduling requests return a quiet `201` but are
not sent to the office, stored, or tracked as conversions.

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

Current limitation: request policy is per-request validation; the app does not
yet provide a shared distributed rate limiter across serverless instances.
