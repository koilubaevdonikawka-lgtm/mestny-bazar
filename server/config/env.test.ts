import { afterAll, describe, expect, it, vi } from "vitest";
import { serverEnvSchema } from "./env";

const validEnv = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
};

describe("serverEnvSchema", () => {
  it("accepts a minimal valid environment", () => {
    expect(serverEnvSchema.safeParse(validEnv).success).toBe(true);
  });

  it("rejects a missing SUPABASE_SERVICE_ROLE_KEY — required in every deployment configuration, since server/di/container.ts unconditionally constructs every Supabase-backed repository, including the catalog itself (ADR-002)", () => {
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

  it("leaves Finik/Telegram/WhatsApp secrets optional — those integrations are still stubs", () => {
    expect(serverEnvSchema.safeParse(validEnv).success).toBe(true);
  });
});

// getServerEnv() memoizes into a module-level variable on first call, so each test
// below needs a fresh module instance (vi.resetModules() + dynamic re-import) to
// avoid one test's process.env leaking into another via the cache.
describe("getServerEnv", () => {
  const originalEnv = { ...process.env };

  afterAll(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  async function freshGetServerEnv(overrides: Record<string, string | undefined>) {
    vi.resetModules();
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    const mod = await import("./env");
    return mod.getServerEnv;
  }

  it("returns the parsed environment when config is valid", async () => {
    const getServerEnv = await freshGetServerEnv(validEnv);
    const env = getServerEnv();
    expect(env.SUPABASE_URL).toBe(validEnv.SUPABASE_URL);
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBe(validEnv.SUPABASE_SERVICE_ROLE_KEY);
  });

  it("throws a clear error naming every missing/invalid field when config is invalid", async () => {
    const getServerEnv = await freshGetServerEnv({
      SUPABASE_URL: undefined,
      SUPABASE_SERVICE_ROLE_KEY: undefined,
    });

    expect(() => getServerEnv()).toThrow(/SUPABASE_URL/);
    expect(() => getServerEnv()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
    expect(() => getServerEnv()).toThrow(/Invalid server configuration/);
  });

  it("memoizes — repeated calls return the exact same object instance", async () => {
    const getServerEnv = await freshGetServerEnv(validEnv);
    expect(getServerEnv()).toBe(getServerEnv());
  });

  it("keeps returning the first successfully-parsed env even if process.env changes afterward", async () => {
    const getServerEnv = await freshGetServerEnv(validEnv);
    const first = getServerEnv();

    process.env.SUPABASE_URL = "https://changed.supabase.co";

    expect(getServerEnv().SUPABASE_URL).toBe(first.SUPABASE_URL);
  });
});
