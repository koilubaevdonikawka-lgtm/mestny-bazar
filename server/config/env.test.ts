import { describe, expect, it } from "vitest";
import { serverEnvSchema } from "./env";

const validEnv = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
};

describe("serverEnvSchema", () => {
  it("accepts a minimal valid environment", () => {
    expect(serverEnvSchema.safeParse(validEnv).success).toBe(true);
  });

  it("rejects a missing SUPABASE_SERVICE_ROLE_KEY — required in every deployment configuration, since server/di/container.ts unconditionally constructs Supabase-backed order/address/seller-product/audit-log repositories regardless of FEATURE_CATALOG_SOURCE", () => {
    const { SUPABASE_SERVICE_ROLE_KEY: _omit, ...rest } = validEnv;
    expect(serverEnvSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects an empty-string SUPABASE_SERVICE_ROLE_KEY", () => {
    expect(serverEnvSchema.safeParse({ ...validEnv, SUPABASE_SERVICE_ROLE_KEY: "" }).success).toBe(
      false,
    );
  });

  it("rejects a missing SUPABASE_URL", () => {
    const { SUPABASE_URL: _omit, ...rest } = validEnv;
    expect(serverEnvSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects an invalid SUPABASE_URL", () => {
    expect(serverEnvSchema.safeParse({ ...validEnv, SUPABASE_URL: "not-a-url" }).success).toBe(
      false,
    );
  });

  it("defaults FEATURE_CATALOG_SOURCE and FEATURE_CHECKOUT_SOURCE when absent", () => {
    const result = serverEnvSchema.parse(validEnv);
    expect(result.FEATURE_CATALOG_SOURCE).toBe("shopify");
    expect(result.FEATURE_CHECKOUT_SOURCE).toBe("platform");
  });

  it("leaves Finik/Telegram/WhatsApp secrets optional — those integrations are still stubs", () => {
    expect(serverEnvSchema.safeParse(validEnv).success).toBe(true);
  });
});
