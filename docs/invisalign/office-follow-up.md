# Invisalign office follow-up workflow

Updated October 28, 2026 for Enzo's review. Weekly capacity of 2–3 new consults
and a front-desk response within one business day, if inquiries arrive like
Formspree, are confirmed. The remaining operating workflow is proposed. No staff member
has been assigned, patient record imported, message sent, or automation enabled.

## Decisions before the pilot

| Decision | Proposed approach | Confirmation needed |
| --- | --- | --- |
| Inquiry owner and backup | One named front-desk owner, plus a backup for absences | Dr. Wong / Kelty chooses the people |
| Weekly capacity | 2–3 new consultations per week | Confirmed; reconcile available slots before enabling paid traffic |
| Initial response | Front desk responds within one business day in America/Los_Angeles, if inquiries arrive like Formspree | Confirmed target; actual office delivery remains unverified |
| Private tracker | Use an approved private office system | Location and access approval unresolved; CSV below is only a template |
| Follow-up cadence | Second attempt after two business days; review unanswered inquiries after five business days | Office approves cadence and channel |
| Campaign | Existing three ad options, approved Invisalign assets, exact budget cap and review date | Enzo and Dr. Wong review before launch |

The response target is an office operating commitment. A form submission
requests availability; it never books a visit. Named owner/backup and genuine
office-delivery/GA ingestion evidence remain unresolved.

## Daily office routine

1. Once the approved private tracker location and staff ownership are recorded,
   check the existing office inbox and that tracker at opening and
   before closing. The existing spam-review safeguard remains in place.
2. For each accepted Invisalign inquiry, create one row in the approved private
   office tracking system. Use the original Formspree submission ID as
   `inquiry_id`; keep identity/contact/clinical details in the office's existing
   approved systems, not in analytics or this blank template.
3. Assign an owner and next-action due date. A provider "open" event means the
   notification was opened; it does not mean anyone contacted or booked the person.
4. Contact the person through their requested channel. Record an attempted
   contact separately from an actual two-way conversation. No automatic SMS or
   ReviewFlow sending is part of this workflow.
5. Once the office confirms a consultation time with the person, record it as
   booked. Record attended only after staff verifies the completed visit.
6. Review pending next actions daily, using the agreed cadence. Respect requests
   to stop contact. Escalate urgent symptoms through the existing office process.
7. Each week, reconcile the inquiry rows with the office appointment system.
   Report aggregate inquiry, contact, booking and attendance outcomes to Enzo.

## Status definitions

| Status | Evidence required | Do not infer from |
| --- | --- | --- |
| Received | Accepted inquiry in Formspree | Button click, preview demo, rejected request, honeypot |
| Contact attempted | Staff logs an actual call or email attempt | Notification delivery/open |
| Contacted | Staff confirms two-way communication | Voicemail or unanswered email |
| Booked | Office confirms an appointment date/time with the person | Requested date/time or form confirmation |
| Attended | Staff verifies the consultation happened | Booking alone |
| Awaiting response | Contact attempt made, reply still pending | Assumed loss or rejection |
| Closed | Staff records declined, duplicate, wrong service, or opted out | Silence alone |

Keep `booked_at` as the original booking date. Put the current appointment date
in `consult_at`; rescheduling changes that field without creating a second lead.
For cancellation or no-show, keep the prior milestones and record the new
`disposition` and next action. A duplicate can reference `duplicate_of` but must
not increase unique inquiry totals. Do not overwrite history to improve a rate.

## Blank outcome tracker

Use [outcome-tracker.csv](outcome-tracker.csv) as a draft import template for an
approved private office tool. It contains headers only and is not a live patient
list. Use ISO dates; business-day calculations and appointment times use
America/Los_Angeles. No names, emails, phone numbers, free-text medical notes,
or diagnosis fields belong in this tracker. Opaque IDs are still private and
must not be published or sent to GA4, Vercel Analytics, ad platforms, or GitHub.

- `inquiry_id`: original Formspree ID, never a browser-generated patient identifier.
- `received_at`: original inquiry timestamp, not the date it was recovered/imported.
- `service`, `source`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`:
  copy the existing non-identifying source fields; never guess missing attribution.
- `owner`, `status`, `last_attempt_at`, `attempt_count`, `next_action_due`:
  office responsibility and follow-through.
- `contacted_at`, `booked_at`, `consult_at`, `attended_at`: staff-verified milestones.
- `disposition`: active, canceled, no_show, declined, opted_out, duplicate, wrong_service.
- `duplicate_of`: original inquiry ID when staff confirms a duplicate.

## Weekly scorecard

Use the same received-date cohort and source filter for numerators and
denominators. Show counts beside rates, and label young cohorts as incomplete.
Do not mix this week's bookings with a different week's inquiries.

- Accepted unique Invisalign inquiries (exclude confirmed duplicates/tests).
- First-response coverage and time to first actual contact attempt.
- Contacted / accepted inquiries.
- Booked / accepted inquiries.
- Attended / booked, with enough time for the consultation to occur.
- Paid campaign cost per booked and attended consultation only when spend and
  inquiry-source attribution refer to the same pilot/cohort. No fabricated baseline.

Initially staff records outcomes manually in the approved office tool. This
release does not add dashboard write access or an unverified Dentrix integration.
Review the workflow with the office before using real records.

## Example campaign link

`https://www.chriswongdds.com/invisalign-consult?utm_source=chatgpt&utm_medium=cpc&utm_campaign=wong_invisalign_pilot&utm_content=option_1`

Use stable `option_1`/`option_2`/`option_3` tags matching the reviewed ads.
Paid ChatGPT visits are classified as `campaign`, with the UTM source retained
in the office inquiry. Untagged ChatGPT referrals are `ai_assistant`; they do
not prove paid-ad attribution. ChatGPT cpc traffic must never become Google Ads.
Do not put names, contact details, health concerns, or click identifiers in tags.
