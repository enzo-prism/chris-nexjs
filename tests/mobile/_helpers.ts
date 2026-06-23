import type { Page } from "@playwright/test";

/**
 * Navigate to a route and wait for the SPA to hydrate. The site server-renders
 * markup but the interactive chrome (consent banner, mobile action bar, etc.)
 * is mounted client-side after hydration, so we wait for the network to settle
 * and give React a tick to mount the deferred/dynamic components.
 */
export async function gotoAndHydrate(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  // Best-effort: let lazy/dynamic chrome and data fetches settle. networkidle
  // can be flaky if analytics keeps a connection open, so cap the wait.
  await page
    .waitForLoadState("networkidle", { timeout: 8_000 })
    .catch(() => {
      /* analytics/long-poll kept the network busy; proceed anyway */
    });
}

/** Computed font-size in px for an element handle. */
export const FONT_SIZE_PX = (el: Element): number =>
  parseFloat(window.getComputedStyle(el).fontSize);

/**
 * Both /contact and /schedule render the multi-step AppointmentForm funnel. The
 * text-entry fields (name / phone / email / notes) live on the *contact* step,
 * not the first step, so to verify them we must advance the funnel: dismiss the
 * consent banner, pick an appointment type, and click Continue. With the
 * default schedulingMode of "first_available" the funnel is two steps, so one
 * Continue lands on the final contact step (where "Request My Appointment"
 * appears).
 */
export async function advanceFunnelToContactStep(page: Page): Promise<void> {
  const decline = page.getByRole("button", { name: /^decline$/i });
  if (await decline.isVisible().catch(() => false)) {
    await decline.click();
  }

  const appointmentGroup = page.getByRole("radiogroup", {
    name: /appointment type/i,
  });
  await appointmentGroup.waitFor({ state: "visible", timeout: 20_000 });
  await appointmentGroup.locator("label").first().click();

  const continueBtn = page.getByRole("button", { name: /^continue$/i });
  await continueBtn.scrollIntoViewIfNeeded();
  await continueBtn.click();

  // Contact step is the final step: the submit CTA confirms we arrived.
  await page
    .getByRole("button", { name: /request my appointment/i })
    .waitFor({ state: "visible", timeout: 15_000 });
}
