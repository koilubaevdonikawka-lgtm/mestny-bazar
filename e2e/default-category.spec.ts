import { test, expect } from "@playwright/test";

/**
 * Regression guard for the category-default investigation (multiple rounds
 * this session: reported wrong defaults never reproduced against live
 * code+data, but nothing previously caught this class of bug automatically).
 * Each Playwright test gets a fresh, isolated browser context with no
 * storage by default — equivalent to a private window, no manual localStorage
 * clearing needed.
 */
test("first-ever visit selects the first top-level category (Продукты питания) as active", async ({
  page,
}) => {
  await page.goto("/");

  const categoryButtons = page.locator("button[aria-pressed]");
  // Generous timeout here specifically: the category row only appears once
  // useQuery(["categories"]) resolves (client-side fetch, no SSR loader for
  // this data — see index.tsx), and a cold dev-server's first-ever request
  // also pays a one-time route-compilation cost on top of that round trip.
  await expect(categoryButtons.first()).toBeVisible({ timeout: 20_000 });

  const pressedButtons = page.locator('button[aria-pressed="true"]');
  await expect(pressedButtons).toHaveCount(1);
  await expect(pressedButtons.first()).toHaveText("Продукты питания");

  await expect(categoryButtons.first()).toHaveAttribute("aria-pressed", "true");
  await expect(categoryButtons.first()).toHaveText("Продукты питания");
});
