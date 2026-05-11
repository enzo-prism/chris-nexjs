# Scheduling Event Taxonomy

Analytics events for `/schedule` mobile-first scheduling flow.

## Shared event payload context

Include these fields on all schedule events where possible:

- `source`: `"schedule_page_form"` (or versioned source)
- `device_type`: `mobile | tablet | desktop | unknown`
- `page_path`: normalized route path
- `page_category`: route category from `shared/analytics.ts`
- `scheduling_mode`: `first_available | choose_preferences`
- `appointment_type`: selected appointment type or `"unselected"`
- `is_emergency`: `"true" | "false"`

## Event definitions

1. `schedule_view`
- Fires once when scheduling UI is viewed.

2. `schedule_start`
- Fires once when user enters scheduling flow.
- Maintained for continuity with historical reporting.

3. `schedule_step_view`
- Fires on step change.
- Additional fields:
  - `step_index`
  - `step_name`
  - `total_steps`

4. `schedule_step_continue`
- Fires when user successfully validates a step and moves forward.
- Additional fields:
  - `step_index`
  - `step_name`
  - `total_steps`

5. `schedule_field_error`
- Fires for each field-level validation failure when trying to continue/submit.
- Additional fields:
  - `field`
  - `error_type`
  - `step_index`
  - `step_name`

6. `schedule_back`
- Fires when user navigates to the previous step.
- Additional fields:
  - `step_index`
  - `step_name`

7. `schedule_submit_attempt`
- Fires immediately before API submit.
- Additional fields:
  - `step_index`
  - `step_name`
  - `total_steps`

8. `schedule_submit_success`
- Fires after successful API response.
- Additional fields:
  - `contactPreference`

9. `schedule_submit_failure`
- Fires after failed API response or request error.
- Additional fields:
  - `reason`

10. `schedule_abandonment_checkpoint`
- Fires at `30s` and `90s` if flow is not completed.
- Additional fields:
  - `seconds_elapsed`
  - `step_index`
  - `step_name`

## Legacy conversion events retained

The following events are still emitted for continuity with existing dashboards:

- `schedule_submit`
- `schedule_submit_emergency`
- `schedule_submit_new_patient`
- `schedule_submit_invisalign`

## Vercel custom events

Keep Vercel sparse so the dashboard stays readable. Only these schedule-related events go to Vercel:

- `schedule_start`
- `schedule_submit_failure`
- `appointment_request_submit` from the server after successful `/api/schedule-request` handling

Vercel custom data is capped at two flat primitive properties by `shared/analytics.ts`.

## QA checklist

- Confirm all step events fire in correct order for:
  - `choose_preferences` flow
  - `first_available` flow (step skip case)
- Confirm field error events include field keys and messages.
- Confirm abandonment checkpoint events stop after successful submit.
- Confirm `schedule_submit_success` and legacy submit events both fire on success.
- Confirm Vercel receives only `schedule_start`, `schedule_submit_failure`, and server-confirmed `appointment_request_submit`.
