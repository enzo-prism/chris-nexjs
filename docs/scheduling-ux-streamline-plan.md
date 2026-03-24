# Scheduling UX Streamline (Mobile-First)

Implementation reference for the `/schedule` request flow redesign.

## Objective

- Reduce mobile friction by replacing a long single-form flow with a progressive step experience.
- Keep the existing request-based scheduling model (no real-time slot engine).
- Maintain backward-compatible API intake while introducing the v2 payload contract.

## Flow summary

1. Step 1: Visit Needs
- Appointment type (required)
- Urgent care toggle (optional)
- Scheduling mode (required):
  - `first_available`
  - `choose_preferences`

2. Step 2: Contact Details
- First name (required)
- Last name (required)
- Phone (required)
- Email (required)
- Contact preference (required): phone, text, email

3. Step 3: Scheduling Preferences (conditional)
- Required only when `schedulingMode=choose_preferences`
- Preferred days (required, 1-3 days)
- Preferred time (required)
- Insurance provider (optional)
- Notes (optional)

If `schedulingMode=first_available`, the flow skips Step 3 and submits from Step 2.

## Mobile UX behavior

- Single-column form controls throughout scheduling.
- Step progress rail:
  - `Step X of N`
  - Step title and helper description.
- Sticky mobile action area:
  - Back/Continue/Submit actions.
  - Persistent urgent fallback CTA: call office.
  - Safe-area bottom padding.
- Minimum target size:
  - Interactive chips, toggles, and buttons use a minimum 44px touch height.
- Error handling:
  - Inline field-level errors on blur/submit.
  - Step-level summary links to first invalid field.
- Data persistence:
  - Values remain when moving backward between steps.

## Data contract

Canonical frontend payload is `ScheduleRequestV2` in [scheduleRequest.ts](/Users/enzo/chris-website/shared/scheduleRequest.ts):

- `firstName` (required)
- `lastName` (required)
- `phone` (required, normalized server-side)
- `email` (required)
- `appointmentType` (required)
- `isEmergency` (required boolean)
- `schedulingMode` (required enum)
- `preferredDays` (conditional)
- `preferredTime` (conditional)
- `contactPreference` (required enum)
- `insuranceProvider` (optional)
- `message` (optional)
- `source` (optional)
- `sourceUrl` (optional)
- `utmParams` (optional)

Legacy payloads are still accepted by [route.ts](/Users/enzo/chris-website/app/api/schedule-request/route.ts) and normalized into v2.

## API compatibility and normalization

- Accepts both:
  - Legacy schedule payload shape
  - `ScheduleRequestV2` shape
- Phone normalization:
  - Accepts 10 digits directly.
  - Accepts 11 digits when leading digit is `1`, then trims to 10.
- Downstream integrations (Formspree/webhooks) remain compatible with existing fields.

## Performance behavior on `/schedule`

- Google reviews widget script is deferred until the review section is near viewport.
- Fallback allows explicit user-triggered load.
- Scheduling form is prioritized for early interaction.

Latest measured audit snapshot is documented in:

- [scheduling-audit-2026-03-04.md](/Users/enzo/chris-website/docs/scheduling-audit-2026-03-04.md)

## Verification checklist

Functional:
- Progress and skip logic works for both scheduling modes.
- Legacy and v2 payloads both return `201` when valid.
- Step-level validation blocks progression correctly.

Mobile UX:
- Sticky action bar remains usable with keyboard open.
- Tap targets remain easy to hit in 375px and 390px viewports.
- Error summary links move focus to invalid controls.

Performance:
- `/schedule` interactive form appears before reviews script execution.
- No regressions in `/schedule` Core Web Vitals trend after release.

## Known follow-ups (post-launch)

- Reduce main-thread JS work further on `/schedule` to move LCP/TBT toward targets.
- Resolve footer contrast misses detected in Lighthouse accessibility checks.
- Fix heading-order sequence warning in the scheduling section content hierarchy.
