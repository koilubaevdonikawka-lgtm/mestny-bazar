import { afterEach, describe, expect, it } from "vitest";
import { createServices, getServices, type ServiceContainer } from "./container";
import { serverEnvSchema, type ServerEnv } from "@server/config/env";
import { CheckoutService } from "@server/domain/checkout.service";
import { SupabaseProductRepository } from "@server/adapters/supabase/product.repository";

/**
 * server/di/container.ts is the single Composition Root — every domain
 * service, repository, and policy in the app is wired here, unconditionally,
 * once per isolate. It had zero test coverage despite being the single
 * highest-blast-radius file in the codebase: a broken constructor signature
 * or a dropped field here would silently take down the whole app, and
 * nothing would catch it. None of the repository/adapter constructors touch
 * Supabase eagerly (confirmed by reading each — no explicit constructors
 * exist on the Supabase repositories, and FinikPaymentAdapter has none
 * either), so this is fully testable with a syntactically valid but fake
 * SUPABASE_SERVICE_ROLE_KEY — no real credentials or network access needed.
 */
function fakeEnv(overrides: Partial<ServerEnv> = {}): ServerEnv {
  return serverEnvSchema.parse({
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "fake-service-role-key-for-wiring-test-only",
    ...overrides,
  });
}

const EXPECTED_KEYS: Array<keyof ServiceContainer> = [
  "catalog",
  "categories",
  "checkout",
  "orderService",
  "adminOrderService",
  "warehouseOrderService",
  "courierOrderService",
  "sellerProductService",
  "addressService",
  "notificationService",
  "notificationCenter",
  "catalogProducts",
  "orderProducts",
  "orders",
  "sellerProducts",
  "addresses",
  "zones",
  "payments",
  "checkoutPayment",
  "paymentPolicy",
  "orderLifecycle",
  "productPublication",
  "marketplaceStandards",
  "marketplaceEvents",
  "auditLog",
  "aiWorkers",
  "aiOrchestrator",
  "notifications",
  "orderEvents",
];

describe("createServices", () => {
  it("wires a complete container with every expected field defined", () => {
    const services = createServices(fakeEnv());
    for (const key of EXPECTED_KEYS) {
      expect(services[key], `missing or undefined field: ${key}`).toBeDefined();
    }
  });

  it("wires checkout as a real CheckoutService instance", () => {
    const services = createServices(fakeEnv());
    expect(services.checkout).toBeInstanceOf(CheckoutService);
  });

  it("routes the buyer catalog to SupabaseProductRepository — Supabase is the sole catalog source (ADR-002)", () => {
    const services = createServices(fakeEnv());
    expect(services.catalogProducts).toBeInstanceOf(SupabaseProductRepository);
  });

  it("uses SupabaseProductRepository for order/checkout inventory too — same instance path as the browse catalog", () => {
    const services = createServices(fakeEnv());
    expect(services.orderProducts).toBeInstanceOf(SupabaseProductRepository);
  });
});

describe("getServices", () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  });

  it("memoizes the container — repeated calls return the exact same instance", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "fake-service-role-key-for-wiring-test-only";

    const first = getServices();
    const second = getServices();
    expect(second).toBe(first);
  });
});
