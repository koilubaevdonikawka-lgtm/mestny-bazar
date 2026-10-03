import { test, expect, type Request } from "@playwright/test";

/**
 * Regression guard for guest checkout (Задача №314: signing in is optional — a
 * guest orders with phone + address only). Fresh context = private window: no
 * session, no localStorage.
 *
 * Covers what a guest sees on opening the cart (the owner's incognito test once
 * read a lone "Войти" button as "sign-in required"): the "Оформление без
 * регистрации" heading, cash preselected, the order button visible at once and
 * "Войти" only as a text link BELOW it; pressing the button with empty fields
 * highlights them instead of hiding the button; a filled form then submits the
 * order WITHOUT a session and without any sign-in redirect.
 *
 * The order-creating server-function call is intercepted and aborted, so the
 * test never creates a real order — safe to run against production too:
 *   E2E_BASE_URL=https://mesnyibazar.com npx playwright test e2e/guest-checkout.spec.ts
 * (the server side of the same guarantee — no session → checkout(null, …) — is
 * covered by checkout.executor.test.ts / checkout.service.test.ts).
 *
 * E2E_GUEST_PRODUCT_PATH overrides the product used (it must be in stock).
 */
const PRODUCT_PATH = process.env.E2E_GUEST_PRODUCT_PATH ?? "/product/product-1788338988457";
const SIGN_IN_URL = /accounts\.google\.com|oauth\.telegram\.org|\/auth\/v1\/authorize/;

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, locale: "ru-RU" });

test("a guest sees the order button at once and can order without signing in", async ({ page }) => {
  const visited: string[] = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) visited.push(frame.url());
  });

  const orderRequests: Request[] = [];
  await page.route("**/_serverFn/**", async (route) => {
    const request = route.request();
    if (request.method() === "POST" && /idempotencyKey/.test(request.postData() ?? "")) {
      orderRequests.push(request);
      return route.abort();
    }
    return route.continue();
  });

  await page.goto(PRODUCT_PATH);
  const addToCart = page.getByRole("button", { name: /^в корзину$/i }).first();
  await expect(addToCart, `${PRODUCT_PATH} must be in stock`).toBeEnabled({ timeout: 20_000 });
  // A click that lands before hydration does nothing (cold dev server) — retry
  // until the persisted guest cart (cartStore, "platform-cart") holds the item.
  await expect(async () => {
    await addToCart.click();
    const items = await page.evaluate(
      () => JSON.parse(localStorage.getItem("platform-cart") ?? "{}")?.state?.items?.length ?? 0,
    );
    expect(items).toBeGreaterThan(0);
  }).toPass({ timeout: 20_000 });

  await page.goto("/cart");
  await expect(page.getByTestId("guest-checkout-fields")).toBeVisible({ timeout: 20_000 });

  // 1. First look: explicit guest heading, cash preselected, order button there.
  await expect(page.getByRole("heading", { name: "Оформление без регистрации" })).toBeVisible();
  await expect(page.getByRole("button", { name: /оплата наличными/i })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const submit = page.getByRole("button", { name: /^оформить заказ$/i });
  await expect(submit).toBeVisible();
  await expect(submit).toBeEnabled();

  // 2. Sign-in is only a text link, below the order button — no "Войти" button.
  const signInLink = page.getByTestId("guest-sign-in-link");
  await expect(signInLink).toBeVisible();
  const submitBox = await submit.boundingBox();
  const linkBox = await signInLink.boundingBox();
  expect(linkBox!.y).toBeGreaterThan(submitBox!.y);
  await expect(
    page
      .getByRole("button", { name: /^войти$/i })
      .and(page.locator(':not([data-testid="guest-sign-in-link"])')),
  ).toHaveCount(0);

  // 3. Empty required fields: highlighted, nothing sent.
  await submit.click();
  await expect(page.locator("#guest-address")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#guest-phone")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#guest-address-error")).toBeVisible();
  await expect(page.locator("#guest-phone-error")).toBeVisible();
  expect(orderRequests).toHaveLength(0);

  // 4. Filled in: the order goes out as a guest.
  await page.fill("#guest-address", "г. Кант, ул. Тестовая 1, кв 1");
  await page.fill("#guest-phone", "+996700123456");
  if ((await page.locator("#guest-zone option").count()) > 1) {
    await page.selectOption("#guest-zone", { index: 1 });
  }
  await expect(page.locator("#guest-address")).toHaveAttribute("aria-invalid", "false");
  await submit.click();

  await expect.poll(() => orderRequests.length, { timeout: 15_000 }).toBe(1);
  expect(orderRequests[0].headers()["authorization"]).toBeUndefined();
  expect(orderRequests[0].postData()).toContain("+996700123456");
  expect(orderRequests[0].postData()).toContain("CASH");
  expect(new URL(page.url()).pathname).toBe("/cart");
  expect(visited.filter((url) => SIGN_IN_URL.test(url))).toEqual([]);
});
