import { afterEach, describe, expect, it, vi } from "vitest";
import { RateLimitedError } from "@server/domain/rate-limit.errors";

const { getRequest, setResponseStatus, getServices } = vi.hoisted(() => ({
  getRequest: vi.fn(),
  setResponseStatus: vi.fn(),
  getServices: vi.fn(),
}));

vi.mock("@tanstack/react-start/server", () => ({ getRequest, setResponseStatus }));
vi.mock("@server/di/container", () => ({ getServices }));

const { enforceRateLimit, extractClientIp } = await import("@server/functions/rate-limit.guard");

const headers = (init: Record<string, string>) => new Headers(init);

describe("extractClientIp (Задача №288)", () => {
  it("prefers Cloudflare's cf-connecting-ip", () => {
    expect(
      extractClientIp(headers({ "cf-connecting-ip": "1.2.3.4", "x-forwarded-for": "9.9.9.9" })),
    ).toBe("1.2.3.4");
  });

  it("falls back to the first x-forwarded-for hop", () => {
    expect(extractClientIp(headers({ "x-forwarded-for": "5.5.5.5, 6.6.6.6" }))).toBe("5.5.5.5");
  });

  it("returns null when neither header is present or there are no headers", () => {
    expect(extractClientIp(headers({}))).toBeNull();
    expect(extractClientIp(undefined)).toBeNull();
  });
});

describe("enforceRateLimit (Задача №288)", () => {
  afterEach(() => vi.clearAllMocks());

  it("passes the real IP and user id to the service and does nothing else when allowed", async () => {
    getRequest.mockReturnValue({ headers: headers({ "cf-connecting-ip": "1.2.3.4" }) });
    const enforce = vi.fn(async () => {});
    getServices.mockReturnValue({ rateLimit: { enforce } });

    await enforceRateLimit("CHECKOUT", { userId: "u1" });

    expect(enforce).toHaveBeenCalledWith("CHECKOUT", { ip: "1.2.3.4", userId: "u1" });
    expect(setResponseStatus).not.toHaveBeenCalled();
  });

  it("countIp:false leaves the IP out so it is not counted twice per request", async () => {
    getRequest.mockReturnValue({ headers: headers({ "cf-connecting-ip": "1.2.3.4" }) });
    const enforce = vi.fn(async () => {});
    getServices.mockReturnValue({ rateLimit: { enforce } });

    await enforceRateLimit("CHECKOUT", { userId: "u1", countIp: false });

    expect(enforce).toHaveBeenCalledWith("CHECKOUT", { ip: null, userId: "u1" });
  });

  it("on rejection sets HTTP 429 and rethrows the Russian-message error", async () => {
    getRequest.mockReturnValue({ headers: headers({ "cf-connecting-ip": "1.2.3.4" }) });
    getServices.mockReturnValue({
      rateLimit: {
        enforce: vi.fn(async () => {
          throw new RateLimitedError();
        }),
      },
    });

    const failure = await enforceRateLimit("CHECKOUT").catch((e: unknown) => e);

    expect(failure).toBeInstanceOf(RateLimitedError);
    expect(setResponseStatus).toHaveBeenCalledWith(429);
  });

  it("does not turn an unrelated error into a 429", async () => {
    getRequest.mockReturnValue({ headers: headers({}) });
    getServices.mockReturnValue({
      rateLimit: {
        enforce: vi.fn(async () => {
          throw new Error("boom");
        }),
      },
    });

    await expect(enforceRateLimit("CHECKOUT")).rejects.toThrow("boom");
    expect(setResponseStatus).not.toHaveBeenCalled();
  });
});
