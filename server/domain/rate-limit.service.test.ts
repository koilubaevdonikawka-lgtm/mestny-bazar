import { afterEach, describe, expect, it, vi } from "vitest";
import { RateLimitPolicy, RateLimitService } from "@server/domain/rate-limit.service";
import { RateLimitedError } from "@server/domain/rate-limit.errors";
import type { IRateLimiter } from "@server/ports/rate-limiter.port";
import { RATE_LIMIT_BINDINGS } from "@shared/security/rate-limit-bindings";
import { logger } from "@shared/observability/logger";

/** In-memory fixed-window fake honoring each binding's real configured limit. */
function fakeLimiter(): IRateLimiter & { calls: Array<[string, string]> } {
  const counts = new Map<string, number>();
  const calls: Array<[string, string]> = [];
  return {
    calls,
    async isAllowed(binding, key) {
      calls.push([binding, key]);
      const id = `${binding}|${key}`;
      const next = (counts.get(id) ?? 0) + 1;
      counts.set(id, next);
      return next <= RATE_LIMIT_BINDINGS[binding].limit;
    },
  };
}

describe("RateLimitService (Задача №288)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("lets a rapid burst up to the checkout IP limit through, then rejects the next request", async () => {
    const service = new RateLimitService(fakeLimiter());
    const limit = RATE_LIMIT_BINDINGS.CHECKOUT_IP.limit;

    for (let i = 0; i < limit; i++) {
      await expect(
        service.enforce(RateLimitPolicy.CHECKOUT, { ip: "1.2.3.4" }),
      ).resolves.toBeUndefined();
    }
    await expect(
      service.enforce(RateLimitPolicy.CHECKOUT, { ip: "1.2.3.4" }),
    ).rejects.toBeInstanceOf(RateLimitedError);
  });

  it("counts IPs independently — one noisy IP never limits another", async () => {
    const service = new RateLimitService(fakeLimiter());
    for (let i = 0; i < RATE_LIMIT_BINDINGS.CHECKOUT_IP.limit + 5; i++) {
      await service.enforce(RateLimitPolicy.CHECKOUT, { ip: "1.1.1.1" }).catch(() => {});
    }
    await expect(
      service.enforce(RateLimitPolicy.CHECKOUT, { ip: "2.2.2.2" }),
    ).resolves.toBeUndefined();
  });

  it("catches 'many IPs, one account' through the per-user counter", async () => {
    const service = new RateLimitService(fakeLimiter());
    const limit = RATE_LIMIT_BINDINGS.CHECKOUT_USER.limit;

    for (let i = 0; i < limit; i++) {
      await service.enforce(RateLimitPolicy.CHECKOUT, { ip: `10.0.0.${i}`, userId: "u1" });
    }
    await expect(
      service.enforce(RateLimitPolicy.CHECKOUT, { ip: "10.0.9.9", userId: "u1" }),
    ).rejects.toBeInstanceOf(RateLimitedError);
  });

  it("skips a counter whose identity part is unknown (no IP in local dev, no userId yet)", async () => {
    const limiter = fakeLimiter();
    const service = new RateLimitService(limiter);

    await service.enforce(RateLimitPolicy.CHECKOUT, {});
    expect(limiter.calls).toEqual([]);

    await service.enforce(RateLimitPolicy.CHECKOUT, { userId: "u1" });
    expect(limiter.calls).toEqual([["CHECKOUT_USER", "user:u1"]]);
  });

  it("gives policies their own counters (the AI upload cap is separate from the general upload counter)", async () => {
    const limiter = fakeLimiter();
    const service = new RateLimitService(limiter);

    await service.enforce(RateLimitPolicy.MEDIA_UPLOAD_AI, { ip: "9.9.9.9", userId: "s1" });
    expect(limiter.calls).toEqual([["MEDIA_AI_USER", "user:s1"]]);
  });

  it("logs a rejection with only the action, scope, limit and IP — never the user id", async () => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});
    const service = new RateLimitService({ isAllowed: async () => false });

    await expect(
      service.enforce(RateLimitPolicy.CHECKOUT, { ip: "5.6.7.8", userId: "secret-user-id" }),
    ).rejects.toBeInstanceOf(RateLimitedError);

    expect(warn).toHaveBeenCalledWith("rate-limit:rejected", {
      action: "CHECKOUT",
      scope: "ip",
      limit: RATE_LIMIT_BINDINGS.CHECKOUT_IP.limit,
      ip: "5.6.7.8",
    });
    expect(JSON.stringify(warn.mock.calls)).not.toContain("secret-user-id");
  });

  it("the rejection message is Russian and tells the caller to wait", () => {
    const error = new RateLimitedError();
    expect(error.message).toMatch(/Слишком много запросов/);
    expect(error.retryAfterSeconds).toBe(60);
  });

  it("every configured window is one Cloudflare accepts (10 or 60 s), with a unique namespace id and name", () => {
    const all = Object.values(RATE_LIMIT_BINDINGS);
    for (const binding of all) expect([10, 60]).toContain(binding.periodSeconds);
    expect(new Set(all.map((b) => b.namespaceId)).size).toBe(all.length);
    expect(new Set(all.map((b) => b.name)).size).toBe(all.length);
  });
});
