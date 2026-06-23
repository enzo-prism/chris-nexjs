import { test, expect, type Locator } from "@playwright/test";
import { advanceFunnelToContactStep, gotoAndHydrate } from "./_helpers";

/**
 * (A) iOS zoom prevention.
 *
 * Mobile Safari auto-zooms when a focused *text-entry* form control has a
 * font-size below 16px. Every visible text input / textarea / native select
 * (or the Radix select trigger, which renders as role="combobox") must
 * therefore compute to >= 16px at a phone viewport.
 *
 * Both /contact and /schedule render the AppointmentForm funnel; the text
 * fields (name / phone / email / insurance / notes) live on the contact step,
 * so we advance the funnel before measuring. Radio buttons / checkboxes are
 * deliberately excluded — they are not typeable and do not trigger iOS zoom.
 */

const MIN_FONT_PX = 16;

// Text-entry input types that trigger iOS auto-zoom when < 16px. Radio,
// checkbox, button, range, color, etc. are not typeable and are excluded.
const TEXT_INPUT_TYPES = [
  "text",
  "email",
  "tel",
  "url",
  "search",
  "password",
  "number",
  "date",
  "datetime-local",
  "month",
  "time",
  "week",
];
const FIELD_SELECTOR = [
  // <input> with no type attribute defaults to "text".
  "input:not([type])",
  ...TEXT_INPUT_TYPES.map((t) => `input[type="${t}" i]`),
  "textarea",
  "select",
  '[role="combobox"]',
].join(", ");

async function collectUndersizedFields(
  locator: Locator,
): Promise<Array<{ describe: string; fontSize: number }>> {
  const count = await locator.count();
  const offenders: Array<{ describe: string; fontSize: number }> = [];

  for (let i = 0; i < count; i += 1) {
    const field = locator.nth(i);
    if (!(await field.isVisible())) continue;

    const fontSize = await field.evaluate(
      (el) => parseFloat(window.getComputedStyle(el).fontSize),
    );
    if (fontSize < MIN_FONT_PX) {
      const describe = await field.evaluate((el) => {
        const tag = el.tagName.toLowerCase();
        const role = el.getAttribute("role") ?? "";
        const name =
          el.getAttribute("name") ??
          el.getAttribute("id") ??
          el.getAttribute("aria-label") ??
          el.getAttribute("placeholder") ??
          "(unnamed)";
        return `${tag}${role ? `[role=${role}]` : ""} "${name}"`;
      });
      offenders.push({ describe, fontSize });
    }
  }
  return offenders;
}

async function assertNoUndersizedFields(page: import("@playwright/test").Page, route: string) {
  const fields = page.locator(FIELD_SELECTOR);
  // At least one text-entry field must be present to make the test meaningful.
  await expect(fields.first()).toBeVisible({ timeout: 15_000 });
  expect(
    await fields.count(),
    `expected text-entry fields on ${route}`,
  ).toBeGreaterThan(0);

  const offenders = await collectUndersizedFields(fields);
  expect(
    offenders,
    `Text-entry fields below ${MIN_FONT_PX}px on ${route} (would trigger iOS zoom):\n` +
      offenders.map((o) => `  - ${o.describe}: ${o.fontSize}px`).join("\n"),
  ).toEqual([]);
}

test("contact funnel text fields are >= 16px to prevent iOS zoom", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/contact");
  // The /contact appointment form opens on the appointment-type step (radios);
  // advance to the contact step to reach the name/phone/email/notes fields.
  await advanceFunnelToContactStep(page);
  await assertNoUndersizedFields(page, "/contact");
});

test("schedule funnel text fields are >= 16px to prevent iOS zoom", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/schedule");
  // The schedule funnel is lazy-loaded; advanceFunnelToContactStep waits for it.
  await advanceFunnelToContactStep(page);
  await assertNoUndersizedFields(page, "/schedule");
});
