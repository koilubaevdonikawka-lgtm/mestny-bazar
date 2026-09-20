import { afterEach, describe, expect, it, vi } from "vitest";
import { RateLimitedError } from "@server/domain/rate-limit.errors";

const { requireUserIdFromRequest, getServices, enforceRateLimit } = vi.hoisted(() => ({
  requireUserIdFromRequest: vi.fn(),
  getServices: vi.fn(),
  enforceRateLimit: vi.fn(async (..._args: unknown[]) => {}),
}));

vi.mock("@server/auth/resolve-user", () => ({ requireUserIdFromRequest }));
vi.mock("@server/di/container", () => ({ getServices }));
vi.mock("@server/functions/rate-limit.guard", () => ({ enforceRateLimit }));

const { executeCreateOrder } = await import("@server/functions/checkout.executor");

const request = {} as never;

describe("checkout.executor rate limit (Задача №288)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("counts the IP before authenticating, then the account without recounting the IP, then checks out", async () => {
    const order: string[] = [];
    enforceRateLimit.mockImplementation(async (...args: unknown[]) => {
      const [policy, options] = args as [string, { countIp?: boolean } | undefined];
      order.push(`${policy}${options?.countIp === false ? ":user" : ":ip"}`);
    });
    requireUserIdFromRequest.mockImplementation(async () => {
      order.push("auth");
      return "user-1";
    });
    const checkout = vi.fn(async () => {
      order.push("checkout");
      return { order: {} };
    });
    getServices.mockReturnValue({ checkout: { checkout } });

    await executeCreateOrder(request);

    expect(order).toEqual(["CHECKOUT:ip", "auth", "CHECKOUT:user", "checkout"]);
    expect(enforceRateLimit).toHaveBeenLastCalledWith("CHECKOUT", {
      userId: "user-1",
      countIp: false,
    });
  });

  it("a rejected IP counter never reaches auth (no Supabase call) or checkout", async () => {
    enforceRateLimit.mockRejectedValueOnce(new RateLimitedError());
    const checkout = vi.fn();
    getServices.mockReturnValue({ checkout: { checkout } });

    await expect(executeCreateOrder(request)).rejects.toBeInstanceOf(RateLimitedError);
    expect(requireUserIdFromRequest).not.toHaveBeenCalled();
    expect(checkout).not.toHaveBeenCalled();
  });

  it("a rejected per-account counter (many IPs, one account) never reaches checkout", async () => {
    enforceRateLimit.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new RateLimitedError());
    requireUserIdFromRequest.mockResolvedValue("user-1");
    const checkout = vi.fn();
    getServices.mockReturnValue({ checkout: { checkout } });

    await expect(executeCreateOrder(request)).rejects.toBeInstanceOf(RateLimitedError);
    expect(checkout).not.toHaveBeenCalled();
  });
});
