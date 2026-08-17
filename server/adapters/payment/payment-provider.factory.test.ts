import { describe, expect, it } from "vitest";
import { createPaymentProvider } from "@server/adapters/payment/payment-provider.factory";
import { FinikPaymentAdapter } from "@server/adapters/payment/finik.adapter";
import { StubPaymentProvider } from "@server/adapters/payment/stub-payment.provider";
import type { ServerEnv } from "@server/config/env";

function makeEnv(overrides: Partial<ServerEnv> = {}): ServerEnv {
  return {
    APP_NAME: "Местный Базар",
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    ...overrides,
  };
}

describe("createPaymentProvider", () => {
  it("returns FinikPaymentAdapter when every required credential is present", () => {
    const provider = createPaymentProvider(
      makeEnv({
        FINIK_API_KEY: "api-key",
        FINIK_RSA_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nfake\n-----END PRIVATE KEY-----",
        FINIK_WEBHOOK_PUBLIC_KEY: "-----BEGIN PUBLIC KEY-----\nfake\n-----END PUBLIC KEY-----",
        FINIK_MERCHANT_ID: "merchant",
        FINIK_ENVIRONMENT: "beta",
      }),
    );

    expect(provider).toBeInstanceOf(FinikPaymentAdapter);
  });

  it("returns StubPaymentProvider when any required credential is missing", () => {
    const provider = createPaymentProvider(makeEnv({ FINIK_API_KEY: "api-key" }));

    expect(provider).toBeInstanceOf(StubPaymentProvider);
  });

  it("returns FinikPaymentAdapter even without FINIK_MERCHANT_ID — not confirmed by official documentation (Промпт №079)", () => {
    const provider = createPaymentProvider(
      makeEnv({
        FINIK_API_KEY: "api-key",
        FINIK_RSA_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nfake\n-----END PRIVATE KEY-----",
        FINIK_WEBHOOK_PUBLIC_KEY: "-----BEGIN PUBLIC KEY-----\nfake\n-----END PUBLIC KEY-----",
        FINIK_ENVIRONMENT: "beta",
      }),
    );

    expect(provider).toBeInstanceOf(FinikPaymentAdapter);
  });

  it("returns StubPaymentProvider when nothing is configured", () => {
    const provider = createPaymentProvider(makeEnv());

    expect(provider).toBeInstanceOf(StubPaymentProvider);
  });
});
