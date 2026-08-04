import { afterEach, describe, expect, it, vi } from "vitest";

const { requireUserIdFromRequest, getServices } = vi.hoisted(() => ({
  requireUserIdFromRequest: vi.fn(),
  getServices: vi.fn(),
}));

vi.mock("@server/auth/resolve-user", () => ({ requireUserIdFromRequest }));
vi.mock("@server/di/container", () => ({ getServices }));

const {
  executeAcceptOwnershipTransfer,
  executeCancelOwnershipTransfer,
  executeInitiateOwnershipTransfer,
} = await import("@server/functions/ownership-transfer.executor");

function fakeTransferDTO(overrides: Record<string, unknown> = {}) {
  return {
    id: "transfer-1",
    initiatorUserId: "user-1",
    targetUserId: "user-2",
    status: "PENDING",
    fullHandover: false,
    createdAt: new Date().toISOString(),
    acceptedAt: null,
    completedAt: null,
    cancelledAt: null,
    ...overrides,
  };
}

function fakeOwnershipTransferService(overrides: Record<string, unknown> = {}) {
  return {
    initiate: vi.fn(async () => fakeTransferDTO()),
    accept: vi.fn(async () => fakeTransferDTO({ status: "COMPLETED" })),
    cancel: vi.fn(async () => fakeTransferDTO({ status: "CANCELLED" })),
    ...overrides,
  };
}

describe("ownership-transfer.executor", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("executeInitiateOwnershipTransfer", () => {
    it("requires authentication and forwards the resolved user id as initiator", async () => {
      requireUserIdFromRequest.mockResolvedValue("user-1");
      const ownershipTransferService = fakeOwnershipTransferService();
      getServices.mockReturnValue({ ownershipTransferService });

      await executeInitiateOwnershipTransfer({ targetUserId: "user-2", fullHandover: true });

      expect(requireUserIdFromRequest).toHaveBeenCalled();
      expect(ownershipTransferService.initiate).toHaveBeenCalledWith("user-1", "user-2", true);
    });

    it("propagates rejection when the caller is not authenticated", async () => {
      requireUserIdFromRequest.mockRejectedValue(new Error("Unauthorized"));
      getServices.mockReturnValue({ ownershipTransferService: fakeOwnershipTransferService() });

      await expect(
        executeInitiateOwnershipTransfer({ targetUserId: "user-2", fullHandover: false }),
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("executeAcceptOwnershipTransfer", () => {
    it("requires authentication and forwards the resolved user id as the acting user", async () => {
      requireUserIdFromRequest.mockResolvedValue("user-2");
      const ownershipTransferService = fakeOwnershipTransferService();
      getServices.mockReturnValue({ ownershipTransferService });

      await executeAcceptOwnershipTransfer("transfer-1");

      expect(ownershipTransferService.accept).toHaveBeenCalledWith("transfer-1", "user-2");
    });
  });

  describe("executeCancelOwnershipTransfer", () => {
    it("requires authentication and forwards the resolved user id as the acting user", async () => {
      requireUserIdFromRequest.mockResolvedValue("user-1");
      const ownershipTransferService = fakeOwnershipTransferService();
      getServices.mockReturnValue({ ownershipTransferService });

      await executeCancelOwnershipTransfer("transfer-1");

      expect(ownershipTransferService.cancel).toHaveBeenCalledWith("transfer-1", "user-1");
    });
  });
});
