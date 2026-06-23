import { test, expect } from "@playwright/test";
import { advanceFunnelToContactStep, gotoAndHydrate } from "./_helpers";

/**
 * (E) Sticky submit on the booking funnel.
 *
 * Intent of the fix: the funnel nav (the wrapper around Back / Continue /
 * "Request My Appointment") is `position: sticky; bottom: 0` on mobile so the
 * primary CTA stays pinned to the bottom of the viewport while the visitor
 * scrolls the (taller-than-viewport) contact step.
 *
 * We verify two things:
 *   1. (robust, computed-style) The CTA lives inside a position: sticky
 *      container.
 *   2. (behavioral) While scrolling, the CTA is actually pinned to the bottom
 *      of the *viewport* (its viewport-relative bottom clamps near the viewport
 *      height) rather than scrolling away.
 */

test("funnel CTA wrapper is position: sticky", async ({ page }) => {
  await gotoAndHydrate(page, "/schedule");

  // Wait for the funnel form to hydrate (Continue button on step 1).
  const continueBtn = page.getByRole("button", { name: /continue/i });
  await expect(continueBtn).toBeVisible({ timeout: 20_000 });

  // The sticky wrapper is the button's containing flex column. Walk up to the
  // nearest ancestor whose computed position is sticky.
  const stickyPosition = await continueBtn.evaluate((btn) => {
    let node: HTMLElement | null = btn as HTMLElement;
    while (node) {
      const pos = window.getComputedStyle(node).position;
      if (pos === "sticky") return pos;
      node = node.parentElement;
    }
    return null;
  });

  expect(
    stickyPosition,
    "Expected the funnel CTA to live inside a position: sticky container so " +
      "it stays pinned to the bottom on mobile; none of its ancestors are sticky.",
  ).toBe("sticky");
});

test('"Request My Appointment" is pinned to the viewport bottom while scrolling', async ({
  page,
}) => {
  await gotoAndHydrate(page, "/schedule");

  // Advance to the final (contact) step where the submit button lives.
  await advanceFunnelToContactStep(page);

  const submit = page.getByRole("button", { name: /request my appointment/i });
  await expect(submit).toBeVisible({ timeout: 15_000 });

  // Sample the submit button's viewport-relative bottom edge across the full
  // scroll range. A CTA that is genuinely sticky to the *viewport* clamps its
  // bottom near the viewport height for every scroll offset where its natural
  // flow position would otherwise be off-screen. If sticky is defeated (e.g. by
  // an `overflow: hidden` ancestor that becomes the sticky containing block),
  // the bottom drifts far from the viewport edge instead.
  const samples = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
      /request my appointment/i.test(b.textContent || ""),
    )!;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const out: Array<{ scrollY: number; bottom: number }> = [];
    for (const f of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
      window.scrollTo(0, Math.round(max * f));
      const r = btn.getBoundingClientRect();
      out.push({ scrollY: Math.round(window.scrollY), bottom: Math.round(r.bottom) });
    }
    return { vh, samples: out };
  });

  // For a viewport-pinned sticky CTA, at least one scroll offset should leave
  // the button clamped near the bottom of the viewport. The bar intentionally
  // pads its bottom by `env(safe-area-inset-bottom) + 0.75rem` so the button
  // sits above the iPhone home indicator (~34px) — Chrome's iPhone-13 emulation
  // applies that inset, so the button bottom lands ~44px above vh when pinned.
  // We allow up to 56px (still far below the ~105px seen when sticky is
  // defeated by an overflow:hidden ancestor). We assert the closest approach.
  const vh = samples.vh;
  const closest = Math.min(
    ...samples.samples.map((s) => Math.abs(s.bottom - vh)),
  );

  expect(
    closest,
    `"Request My Appointment" never pins to the viewport bottom while scrolling.\n` +
      `viewport height=${vh}px; button viewport-bottom across scroll offsets:\n` +
      samples.samples
        .map((s) => `  scrollY=${s.scrollY}: bottom=${s.bottom}`)
        .join("\n") +
      `\nA working position:sticky bottom:0 CTA should clamp its bottom near ` +
      `${vh}px. If this drifts far from ${vh}, the sticky is likely defeated by ` +
      `an overflow:hidden ancestor (the funnel's wrapping <section> has ` +
      `overflow-hidden in ScheduleRequestFunnel.tsx).`,
  ).toBeLessThanOrEqual(56);
});
