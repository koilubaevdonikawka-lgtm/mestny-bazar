import { test, expect, type Request } from "@playwright/test";

/**
 * Regression guard for guest checkout (Задача №314: signing in is optional — a
 * guest orders with phone + address only). Fresh context = private window: no
 * session, no localStorage. Walks product → cart → guest form → cash → submit,
 * and asserts the order request leaves the browser WITHOUT a session and without
 * any sign-in prompt/redirect in between.
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

test("a guest can submit an order without signing in", async ({ page }) => {
  const visited: string[] = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) visited.push(frame.url());
  });

  let orderRequest: Request | null = null;
  await page.route("**/_serverFn/**", async (route) => {
    const request = route.request();
    if (request.method() === "POST" && /idempotencyKey/.test(request.postData() ?? "")) {
      orderRequest = request;
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
  await page.fill("#guest-address", "г. Кант, ул. Тестовая 1, кв 1");
  await page.fill("#guest-phone", "+996700123456");
  if ((await page.locator("#guest-zone option").count()) > 1) {
    await page.selectOption("#guest-zone", { index: 1 });
  }
  await page.getByRole("button", { name: /оплата наличными/i }).click();

  const submit = page.getByRole("button", { name: /^оформить$/i });
  await expect(submit).toBeEnabled();
  await submit.click();

  await expect.poll(() => orderRequest !== null, { timeout: 15_000 }).toBe(true);
  expect(orderRequest!.headers()["authorization"]).toBeUndefined();
  expect(orderRequest!.postData()).toContain("+996700123456");
  expect(new URL(page.url()).pathname).toBe("/cart");
  expect(visited.filter((url) => SIGN_IN_URL.test(url))).toEqual([]);
});
