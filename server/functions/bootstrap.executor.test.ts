import { afterEach, describe, expect, it, vi } from "vitest";
import { RateLimitedError } from "@server/domain/rate-limit.errors";

/**
 * The first executor-level test in this project — every other executor is thin
 * enough (role check + delegate) that its domain service's own tests were judged
 * sufficient. Bootstrap's executor has a real decision worth verifying directly:
 * the status check is intentionally unauthenticated while claim is not (see the
 * executor's own doc comments) — that asymmetry is exactly the kind of thing a
 * refactor could silently break without a test catching it. Mocks the two
 * singleton boundaries (@server/auth/resolve-user, @server/di/container) rather
 * than hitting a real request context or a real Supabase-backed container.
 */
const { requireUserIdFromRequest, getServices, enforceRateLimit } = vi.hoisted(() => ({
  requireUserIdFromRequest: vi.fn(),
  getServices: vi.fn(),
  // Задача №288 — the edge rate limit is covered by its own tests; here it just passes.
  enforceRateLimit: vi.fn(async () => {}),
}));

vi.mock("@server/auth/resolve-user", () => ({ requireUserIdFromRequest }));
vi.mock("@server/di/container", () => ({ getServices }));
vi.mock("@server/functions/rate-limit.guard", () => ({ enforceRateLimit }));

const { executeClaimBootstrap, executeGetBootstrapStatus } =
  await import("@server/functions/bootstrap.executor");

function fakeBootstrapService(overrides: Record<string, unknown> = {}) {
  return {
    getEligibility: vi.fn(async () => "ELIGIBLE" as const),
    claim: vi.fn(async () => {}),
    ...overrides,
  };
}

describe("bootstrap.executor", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("executeGetBootstrapStatus", () => {
    it("does not require authentication", async () => {
      getServices.mockReturnValue({ bootstrapService: fakeBootstrapService() });

      await executeGetBootstrapStatus();

      expect(requireUserIdFromRequest).not.toHaveBeenCalled();
    });

    it("returns the eligibility reported by the domain service", async () => {
      getServices.mockReturnValue({
        bootstrapService: fakeBootstrapService({
          getEligibility: vi.fn(async () => "COMPLETED" as const),
        }),
      });

      const result = await executeGetBootstrapStatus();

      expect(result).toEqual({ eligibility: "COMPLETED" });
    });
  });

  describe("executeClaimBootstrap", () => {
    it("requires authentication before claiming", async () => {
      requireUserIdFromRequest.mockResolvedValue("user-1");
      const bootstrapService = fakeBootstrapService();
      getServices.mockReturnValue({ bootstrapService });

      await executeClaimBootstrap();

      expect(requireUserIdFromRequest).toHaveBeenCalled();
      expect(bootstrapService.claim).toHaveBeenCalledWith("user-1");
    });

    it("never takes a client-supplied user id — only the resolved identity", async () => {
      requireUserIdFromRequest.mockResolvedValue("resolved-user");
      const bootstrapService = fakeBootstrapService();
      getServices.mockReturnValue({ bootstrapService });

      await executeClaimBootstrap();

      expect(bootstrapService.claim).toHaveBeenCalledWith("resolved-user");
      expect(bootstrapService.claim).not.toHaveBeenCalledWith(
        expect.not.stringMatching("resolved-user"),
      );
    });

    it("propagates rejection when the caller is not authenticated", async () => {
      requireUserIdFromRequest.mockRejectedValue(new Error("Unauthorized"));
      getServices.mockReturnValue({ bootstrapService: fakeBootstrapService() });

      await expect(executeClaimBootstrap()).rejects.toThrow("Unauthorized");
    });

    it("returns the post-claim eligibility", async () => {
      requireUserIdFromRequest.mockResolvedValue("user-1");
      getServices.mockReturnValue({
        bootstrapService: fakeBootstrapService({
          getEligibility: vi.fn(async () => "COMPLETED" as const),
        }),
      });

      const result = await executeClaimBootstrap();

      expect(result).toEqual({ eligibility: "COMPLETED" });
    });

    it("propagates BootstrapAlreadyCompletedError-shaped rejections from the domain service", async () => {
      requireUserIdFromRequest.mockResolvedValue("user-2");
      getServices.mockReturnValue({
        bootstrapService: fakeBootstrapService({
          claim: vi.fn(async () => {
            throw new Error("Bootstrap already completed — a Root Owner already exists");
          }),
        }),
      });

      await expect(executeClaimBootstrap()).rejects.toThrow("Bootstrap already completed");
    });
  });
});

// Задача №288
describe("executeClaimBootstrap rate limit", () => {
  it("a rejected IP counter stops the claim before authentication or the domain service", async () => {
    enforceRateLimit.mockRejectedValueOnce(new RateLimitedError());
    const claim = vi.fn();
    getServices.mockReturnValue({ bootstrapService: { claim } });

    await expect(executeClaimBootstrap()).rejects.toBeInstanceOf(RateLimitedError);
    expect(requireUserIdFromRequest).not.toHaveBeenCalled();
    expect(claim).not.toHaveBeenCalled();
  });
});
