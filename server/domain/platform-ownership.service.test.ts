import { describe, expect, it, vi } from "vitest";
import { PlatformOwnershipService } from "@server/domain/platform-ownership.service";
import type {
  IPlatformOwnershipRepository,
  OwnershipTransferRecord,
  PlatformOwnershipRecord,
} from "@server/ports/platform-ownership.repository";

function makeOwnershipRecord(
  overrides: Partial<PlatformOwnershipRecord> = {},
): PlatformOwnershipRecord {
  return {
    userId: "user-1",
    role: "ROOT_OWNER",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeTransferRecord(
  overrides: Partial<OwnershipTransferRecord> = {},
): OwnershipTransferRecord {
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

function fakeRepo(
  overrides: Partial<IPlatformOwnershipRepository> = {},
): IPlatformOwnershipRepository {
  return {
    getByUserId: vi.fn(async () => null),
    create: vi.fn(async () => {}),
    countByRole: vi.fn(async () => 0),
    createTransfer: vi.fn(async () => makeTransferRecord()),
    getTransferById: vi.fn(async () => null),
    listPendingTransfersForTarget: vi.fn(async () => []),
    acceptTransfer: vi.fn(async () => makeTransferRecord({ status: "ACCEPTED" })),
    cancelTransfer: vi.fn(async () => makeTransferRecord({ status: "CANCELLED" })),
    completeTransfer: vi.fn(async () => makeTransferRecord({ status: "COMPLETED" })),
    ...overrides,
  };
}

describe("PlatformOwnershipService", () => {
  it("getByUserId delegates to the repository and returns null when no record exists", async () => {
    const repo = fakeRepo();
    const service = new PlatformOwnershipService(repo);

    const result = await service.getByUserId("user-1");

    expect(repo.getByUserId).toHaveBeenCalledWith("user-1");
    expect(result).toBeNull();
  });

  it("getByUserId returns the record the repository resolves", async () => {
    const record = makeOwnershipRecord();
    const repo = fakeRepo({ getByUserId: vi.fn(async () => record) });
    const service = new PlatformOwnershipService(repo);

    const result = await service.getByUserId("user-1");

    expect(result).toEqual(record);
  });

  it("create delegates to the repository with the given user and role", async () => {
    const repo = fakeRepo();
    const service = new PlatformOwnershipService(repo);

    await service.create("user-1", "OWNER");

    expect(repo.create).toHaveBeenCalledWith("user-1", "OWNER");
  });

  it("countByRole returns the repository's count without alteration", async () => {
    const repo = fakeRepo({ countByRole: vi.fn(async () => 3) });
    const service = new PlatformOwnershipService(repo);

    const result = await service.countByRole("ROOT_OWNER");

    expect(repo.countByRole).toHaveBeenCalledWith("ROOT_OWNER");
    expect(result).toBe(3);
  });

  it("createTransfer delegates to the repository and returns its result", async () => {
    const transfer = makeTransferRecord();
    const repo = fakeRepo({ createTransfer: vi.fn(async () => transfer) });
    const service = new PlatformOwnershipService(repo);
    const input = { initiatorUserId: "user-1", targetUserId: "user-2", fullHandover: false };

    const result = await service.createTransfer(input);

    expect(repo.createTransfer).toHaveBeenCalledWith(input);
    expect(result).toEqual(transfer);
  });

  it("getTransferById delegates to the repository", async () => {
    const repo = fakeRepo();
    const service = new PlatformOwnershipService(repo);

    await service.getTransferById("transfer-1");

    expect(repo.getTransferById).toHaveBeenCalledWith("transfer-1");
  });

  it("listPendingTransfersForTarget delegates to the repository", async () => {
    const repo = fakeRepo();
    const service = new PlatformOwnershipService(repo);

    await service.listPendingTransfersForTarget("user-2");

    expect(repo.listPendingTransfersForTarget).toHaveBeenCalledWith("user-2");
  });

  it("propagates repository errors instead of swallowing them", async () => {
    const repo = fakeRepo({
      getByUserId: vi.fn(async () => {
        throw new Error("Failed to fetch platform ownership record: boom");
      }),
    });
    const service = new PlatformOwnershipService(repo);

    await expect(service.getByUserId("user-1")).rejects.toThrow(
      "Failed to fetch platform ownership record: boom",
    );
  });
});
