import { afterEach, describe, expect, it, vi } from "vitest";

const { requireUserIdFromRequest, getServices } = vi.hoisted(() => ({
  requireUserIdFromRequest: vi.fn(),
  getServices: vi.fn(),
}));

vi.mock("@server/auth/resolve-user", () => ({ requireUserIdFromRequest }));
vi.mock("@server/di/container", () => ({ getServices }));

const { executeGetAccessProfile } = await import("@server/functions/access-profile.executor");

describe("access-profile.executor", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("requires authentication and resolves access for the caller's own id", async () => {
    requireUserIdFromRequest.mockResolvedValue("user-1");
    const resolveAccess = vi.fn(async () => ({
      accessRoles: ["customer"],
      ownershipRole: null,
      workspaces: ["customer"],
    }));
    getServices.mockReturnValue({ roleResolutionService: { resolveAccess } });

    const result = await executeGetAccessProfile();

    expect(requireUserIdFromRequest).toHaveBeenCalled();
    expect(resolveAccess).toHaveBeenCalledWith("user-1");
    expect(result.workspaces).toEqual(["customer"]);
  });

  it("propagates rejection when the caller is not authenticated", async () => {
    requireUserIdFromRequest.mockRejectedValue(new Error("Unauthorized"));
    getServices.mockReturnValue({ roleResolutionService: { resolveAccess: vi.fn() } });

    await expect(executeGetAccessProfile()).rejects.toThrow("Unauthorized");
  });
});
