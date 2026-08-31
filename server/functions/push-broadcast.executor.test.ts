import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAdminFromRequest, assertMarketingAccess, getServices } = vi.hoisted(() => ({
  requireAdminFromRequest: vi.fn(),
  assertMarketingAccess: vi.fn(),
  getServices: vi.fn(),
}));

vi.mock("@server/auth/resolve-user", () => ({ requireAdminFromRequest }));
vi.mock("@server/auth/assert-marketing-access", () => ({ assertMarketingAccess }));
vi.mock("@server/di/container", () => ({ getServices }));

const { executeGetBroadcastAudience, executeSendPushBroadcast } = await import(
  "@server/functions/push-broadcast.executor"
);

describe("push-broadcast.executor", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("executeGetBroadcastAudience: requires admin, checks the real marketing scope, then reads the audience", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-1", roles: ["admin"] });
    const getAudience = vi.fn(async () => ({
      customerCount: 5,
      cooldownRemainingSeconds: null,
      lastBroadcast: null,
    }));
    getServices.mockReturnValue({ pushBroadcastService: { getAudience } });

    await executeGetBroadcastAudience();

    expect(assertMarketingAccess).toHaveBeenCalledWith("admin-1", ["admin"]);
    expect(getAudience).toHaveBeenCalled();
  });

  it("executeSendPushBroadcast: denies before touching the service when the scope check rejects (a mass send is the highest-blast-radius marketing action)", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-2", roles: ["admin"] });
    assertMarketingAccess.mockRejectedValueOnce(new Error("Access denied"));
    const sendBroadcast = vi.fn();
    getServices.mockReturnValue({ pushBroadcastService: { sendBroadcast } });

    await expect(executeSendPushBroadcast({ title: "T", body: "B" })).rejects.toThrow(
      "Access denied",
    );
    expect(sendBroadcast).not.toHaveBeenCalled();
  });

  it("executeSendPushBroadcast: checks scope then sends with the acting admin's own id", async () => {
    requireAdminFromRequest.mockResolvedValue({ userId: "admin-1", roles: ["admin"] });
    const sendBroadcast = vi.fn(async (title, body, sentBy) => ({
      id: "b-1",
      title,
      body,
      recipientCount: 1,
      sentBy,
      createdAt: "2026-01-01T00:00:00.000Z",
    }));
    getServices.mockReturnValue({ pushBroadcastService: { sendBroadcast } });

    await executeSendPushBroadcast({ title: "T", body: "B" });

    expect(sendBroadcast).toHaveBeenCalledWith("T", "B", "admin-1");
  });
});
