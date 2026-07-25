import { test, expect } from "@playwright/test";
import { advanceFunnelToContactStep, gotoAndHydrate } from "./_helpers";

/** The action row stays in normal flow so it cannot cover form fields. */
test("funnel CTA wrapper does not cover fields", async ({ page }) => {
  await gotoAndHydrate(page, "/schedule");

  const continueBtn = page.getByRole("button", { name: /continue/i });
  await expect(continueBtn).toBeVisible({ timeout: 20_000 });

  const positionedAncestor = await continueBtn.evaluate((btn) => {
    let node: HTMLElement | null = btn as HTMLElement;
    while (node) {
      const pos = window.getComputedStyle(node).position;
      if (pos === "sticky" || pos === "fixed") return pos;
      node = node.parentElement;
    }
    return null;
  });

  expect(positionedAncestor).toBeNull();
});

test('contact fields remain reachable above "Send Appointment Request"', async ({
  page,
}) => {
  await gotoAndHydrate(page, "/schedule");
  await advanceFunnelToContactStep(page);

  const submit = page.getByRole("button", { name: /send appointment request/i });
  await expect(submit).toBeVisible({ timeout: 15_000 });

  const email = page.getByLabel("Email", { exact: true });
  await email.scrollIntoViewIfNeeded();
  await expect(email).toBeVisible();
  const emailBox = await email.boundingBox();
  const submitBox = await submit.boundingBox();
  expect(emailBox).not.toBeNull();
  expect(submitBox).not.toBeNull();
  expect(emailBox!.y + emailBox!.height).toBeLessThan(submitBox!.y);
});
