import { afterEach, describe, expect, it, vi } from "vitest";

const { requireUserIdFromRequest, getServices } = vi.hoisted(() => ({
  requireUserIdFromRequest: vi.fn(),
  getServices: vi.fn(),
}));

vi.mock("@server/auth/resolve-user", () => ({ requireUserIdFromRequest }));
vi.mock("@server/di/container", () => ({ getServices }));

const { executeDeleteMyAccount } = await import("@server/functions/account-deletion.executor");

describe("account-deletion.executor", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the account of the session's own user id", async () => {
    requireUserIdFromRequest.mockResolvedValue("session-user");
    const deleteOwnAccount = vi.fn(async () => ({ status: "deleted" as const }));
    getServices.mockReturnValue({ accountDeletionService: { deleteOwnAccount } });

    const result = await executeDeleteMyAccount();

    expect(deleteOwnAccount).toHaveBeenCalledTimes(1);
    expect(deleteOwnAccount).toHaveBeenCalledWith("session-user");
    expect(result).toEqual({ status: "deleted" });
  });

  it("takes no input at all, so another account can never be targeted", () => {
    expect(executeDeleteMyAccount.length).toBe(0);
  });

  it("rejects unauthenticated callers before touching the service", async () => {
    requireUserIdFromRequest.mockRejectedValue(new Error("Unauthorized"));
    const deleteOwnAccount = vi.fn();
    getServices.mockReturnValue({ accountDeletionService: { deleteOwnAccount } });

    await expect(executeDeleteMyAccount()).rejects.toThrow("Unauthorized");
    expect(deleteOwnAccount).not.toHaveBeenCalled();
  });
});
