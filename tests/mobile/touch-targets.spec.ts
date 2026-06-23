import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

/**
 * (C) Touch targets are at least 44x44px (Apple HIG / WCAG 2.5.5 minimum).
 *
 * - Testimonial carousel dots on the home page.
 * - The three links inside the fixed MobileActionBar.
 * - Footer social links (kept lenient: only checked, not required to be huge).
 */

const MIN = 44;

test("home testimonial dots are >= 44x44px", async ({ page }) => {
  await gotoAndHydrate(page, "/");

  const dots = page.locator('[data-testid="testimonial-dot"]');
  // Carousel dots render only once the testimonials section is present.
  await expect(dots.first()).toBeVisible({ timeout: 20_000 });

  const count = await dots.count();
  expect(count, "expected at least one testimonial dot").toBeGreaterThan(0);

  const offenders: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const box = await dots.nth(i).boundingBox();
    if (!box) {
      offenders.push(`dot #${i + 1}: no bounding box`);
      continue;
    }
    if (box.width < MIN || box.height < MIN) {
      offenders.push(
        `dot #${i + 1}: ${Math.round(box.width)}x${Math.round(box.height)}px`,
      );
    }
  }

  expect(
    offenders,
    `Testimonial dots smaller than ${MIN}x${MIN}px:\n  ` +
      offenders.join("\n  "),
  ).toEqual([]);
});

test("MobileActionBar links are >= 44px tall", async ({ page }) => {
  await gotoAndHydrate(page, "/");

  const bar = page.locator('[data-testid="mobile-action-bar"]');
  await expect(bar).toBeVisible({ timeout: 20_000 });

  const links = bar.locator("a");
  await expect(links).toHaveCount(3);

  const offenders: string[] = [];
  for (let i = 0; i < 3; i += 1) {
    const link = links.nth(i);
    const label = (await link.innerText()).replace(/\s+/g, " ").trim();
    const box = await link.boundingBox();
    if (!box) {
      offenders.push(`link "${label}": no bounding box`);
      continue;
    }
    if (box.height < MIN) {
      offenders.push(`link "${label}": ${Math.round(box.height)}px tall`);
    }
  }

  expect(
    offenders,
    `MobileActionBar links shorter than ${MIN}px:\n  ` + offenders.join("\n  "),
  ).toEqual([]);
});

// Lenient check: we only inspect the *visible* footer social links and require
// them to be tappable (non-zero box). Anything below the 44px ideal is recorded
// as an annotation so a genuine sizing regression is surfaced without making
// this advisory check gate the suite.
test("footer social links are tappable (lenient, reports < 44px)", async ({
  page,
}) => {
  await gotoAndHydrate(page, "/");

  const footer = page.locator("footer");
  await expect(footer).toBeVisible();

  // Footer social row: anchors that carry an aria-label (e.g. Instagram).
  const socialLinks = footer.locator("a[aria-label]");
  const count = await socialLinks.count();
  expect(
    count,
    "expected at least one labelled footer social link",
  ).toBeGreaterThan(0);

  const undersized: string[] = [];
  let checkedVisible = 0;
  for (let i = 0; i < count; i += 1) {
    const link = socialLinks.nth(i);
    if (!(await link.isVisible())) continue;
    checkedVisible += 1;
    const label = (await link.getAttribute("aria-label")) ?? `social #${i + 1}`;
    const box = await link.boundingBox();
    expect(box, `footer social "${label}" has no bounding box`).not.toBeNull();
    // Hard requirement (lenient): must be tappable at all.
    expect(box!.width, `footer social "${label}" has zero width`).toBeGreaterThan(0);
    expect(box!.height, `footer social "${label}" has zero height`).toBeGreaterThan(0);
    if (box!.width < MIN || box!.height < MIN) {
      undersized.push(
        `"${label}": ${Math.round(box!.width)}x${Math.round(box!.height)}px`,
      );
    }
  }

  expect(checkedVisible, "no visible footer social links found").toBeGreaterThan(0);

  if (undersized.length > 0) {
    const note =
      `Footer social links below the ${MIN}x${MIN}px touch-target ideal ` +
      `(advisory): ${undersized.join(", ")}`;
    // eslint-disable-next-line no-console
    console.warn(`[advisory] ${note}`);
    test.info().annotations.push({ type: "advisory", description: note });
  }
});
