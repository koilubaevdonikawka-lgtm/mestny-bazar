import { afterEach, describe, expect, it, vi } from "vitest";
import { CloudflareRateLimiter } from "@server/adapters/cloudflare/cloudflare-rate-limiter.adapter";
import { RATE_LIMIT_BINDINGS } from "@shared/security/rate-limit-bindings";

const g = globalThis as { __env__?: unknown };

describe("CloudflareRateLimiter (Задача №288)", () => {
  afterEach(() => {
    delete g.__env__;
    vi.restoreAllMocks();
  });

  it("asks the named binding with the given key and returns its verdict", async () => {
    const limit = vi.fn(async () => ({ success: false }));
    g.__env__ = { [RATE_LIMIT_BINDINGS.CHECKOUT_IP.name]: { limit } };

    expect(await new CloudflareRateLimiter().isAllowed("CHECKOUT_IP", "ip:1.2.3.4")).toBe(false);
    expect(limit).toHaveBeenCalledWith({ key: "ip:1.2.3.4" });

    limit.mockResolvedValueOnce({ success: true });
    expect(await new CloudflareRateLimiter().isAllowed("CHECKOUT_IP", "ip:1.2.3.4")).toBe(true);
  });

  it("fails open when there is no Worker env (local dev, tests)", async () => {
    expect(await new CloudflareRateLimiter().isAllowed("CHECKOUT_IP", "ip:1.2.3.4")).toBe(true);
  });

  it("fails open when the binding is missing from the deployed config", async () => {
    g.__env__ = {};
    expect(await new CloudflareRateLimiter().isAllowed("CHECKOUT_IP", "ip:1.2.3.4")).toBe(true);
  });

  it("fails open when the binding itself throws — a limiter outage never blocks real customers", async () => {
    g.__env__ = {
      [RATE_LIMIT_BINDINGS.CHECKOUT_IP.name]: {
        limit: async () => {
          throw new Error("binding unavailable");
        },
      },
    };
    expect(await new CloudflareRateLimiter().isAllowed("CHECKOUT_IP", "ip:1.2.3.4")).toBe(true);
  });
});
