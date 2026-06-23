import { test, expect } from "@playwright/test";
import { gotoAndHydrate } from "./_helpers";

/**
 * (F) Landing-page H1 is sized down on mobile.
 *
 * The location landing pages step the hero H1 down from the desktop size
 * (~36px) to a smaller size on phones. At a 390px viewport the H1 must compute
 * to <= 32px so the headline does not wrap awkwardly or overflow.
 */

const MAX_H1_PX = 32;

const ROUTES = ["/dentist-mountain-view", "/dentist-los-altos-hills"];

for (const route of ROUTES) {
  test(`H1 is <= ${MAX_H1_PX}px at 390px on ${route}`, async ({ page }) => {
    await gotoAndHydrate(page, route);

    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible({ timeout: 20_000 });

    const fontSize = await h1.evaluate(
      (el) => parseFloat(window.getComputedStyle(el).fontSize),
    );

    expect(
      fontSize,
      `${route} H1 is ${fontSize}px at a phone viewport; expected <= ${MAX_H1_PX}px ` +
        `(stepped down from the desktop ~36px size).`,
    ).toBeLessThanOrEqual(MAX_H1_PX);
  });
}
