import { describe, expect, it, vi } from "vitest";
import { OwnershipTransferService } from "@server/domain/ownership-transfer.service";
import {
  NotRootOwnerError,
  OwnershipTransferForbiddenError,
  OwnershipTransferNotFoundError,
  SelfTransferError,
} from "@server/domain/ownership-transfer.errors";
import type {
  IPlatformOwnershipRepository,
  OwnershipTransferRecord,
  PlatformOwnershipRecord,
} from "@server/ports/platform-ownership.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";

function makeOwnershipRecord(
  overrides: Partial<PlatformOwnershipRecord> = {},
): PlatformOwnershipRecord {
  return {
    userId: "root-owner-1",
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
    initiatorUserId: "root-owner-1",
    targetUserId: "target-1",
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
    getByUserId: vi.fn(async () => makeOwnershipRecord()),
    create: vi.fn(async () => {}),
    countByRole: vi.fn(async () => 1),
    createTransfer: vi.fn(async () => makeTransferRecord()),
    getTransferById: vi.fn(async () => makeTransferRecord()),
    listPendingTransfersForTarget: vi.fn(async () => []),
    acceptTransfer: vi.fn(async () => makeTransferRecord({ status: "ACCEPTED" })),
    cancelTransfer: vi.fn(async () => makeTransferRecord({ status: "CANCELLED" })),
    completeTransfer: vi.fn(async () => makeTransferRecord({ status: "COMPLETED" })),
    ...overrides,
  };
}

function fakeEventBus(overrides: Partial<IMarketplaceEventBus> = {}): IMarketplaceEventBus {
  return {
    publish: vi.fn(async (_event: MarketplaceEvent) => {}),
    subscribe: vi.fn(),
    ...overrides,
  };
}

describe("OwnershipTransferService.initiate", () => {
  it("rejects a self-transfer before touching the repository", async () => {
    const repo = fakeRepo();
    const service = new OwnershipTransferService(repo, fakeEventBus());

    await expect(service.initiate("user-1", "user-1", false)).rejects.toBeInstanceOf(
      SelfTransferError,
    );
    expect(repo.getByUserId).not.toHaveBeenCalled();
    expect(repo.createTransfer).not.toHaveBeenCalled();
  });

  it("rejects when the initiator is not a Root Owner", async () => {
    const repo = fakeRepo({
      getByUserId: vi.fn(async () => makeOwnershipRecord({ role: "OWNER" })),
    });
    const service = new OwnershipTransferService(repo, fakeEventBus());

    await expect(service.initiate("owner-1", "target-1", false)).rejects.toBeInstanceOf(
      NotRootOwnerError,
    );
    expect(repo.createTransfer).not.toHaveBeenCalled();
  });

  it("rejects when the initiator has no ownership record at all", async () => {
    const repo = fakeRepo({ getByUserId: vi.fn(async () => null) });
    const service = new OwnershipTransferService(repo, fakeEventBus());

    await expect(service.initiate("stranger", "target-1", false)).rejects.toBeInstanceOf(
      NotRootOwnerError,
    );
  });

  it("creates the transfer and publishes ownership.transfer.initiated", async () => {
    const repo = fakeRepo();
    const events = fakeEventBus();
    const service = new OwnershipTransferService(repo, events);

    const result = await service.initiate("root-owner-1", "target-1", true);

    expect(repo.createTransfer).toHaveBeenCalledWith({
      initiatorUserId: "root-owner-1",
      targetUserId: "target-1",
      fullHandover: true,
    });
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "ownership.transfer.initiated" }),
    );
    expect(result.status).toBe("PENDING");
  });
});

describe("OwnershipTransferService.accept", () => {
  it("throws OwnershipTransferNotFoundError for an unknown transfer", async () => {
    const repo = fakeRepo({ getTransferById: vi.fn(async () => null) });
    const service = new OwnershipTransferService(repo, fakeEventBus());

    await expect(service.accept("missing", "target-1")).rejects.toBeInstanceOf(
      OwnershipTransferNotFoundError,
    );
  });

  it("rejects when the acting user is not the target", async () => {
    const repo = fakeRepo();
    const service = new OwnershipTransferService(repo, fakeEventBus());

    await expect(service.accept("transfer-1", "someone-else")).rejects.toBeInstanceOf(
      OwnershipTransferForbiddenError,
    );
    expect(repo.acceptTransfer).not.toHaveBeenCalled();
  });

  it("accepts then completes in sequence, publishing both events", async () => {
    const repo = fakeRepo();
    const events = fakeEventBus();
    const service = new OwnershipTransferService(repo, events);

    const result = await service.accept("transfer-1", "target-1");

    expect(repo.acceptTransfer).toHaveBeenCalledWith("transfer-1");
    expect(repo.completeTransfer).toHaveBeenCalledWith("transfer-1");
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "ownership.transfer.accepted" }),
    );
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "ownership.transfer.completed" }),
    );
    expect(result.status).toBe("COMPLETED");
  });
});

describe("OwnershipTransferService.cancel", () => {
  it("throws OwnershipTransferNotFoundError for an unknown transfer", async () => {
    const repo = fakeRepo({ getTransferById: vi.fn(async () => null) });
    const service = new OwnershipTransferService(repo, fakeEventBus());

    await expect(service.cancel("missing", "root-owner-1")).rejects.toBeInstanceOf(
      OwnershipTransferNotFoundError,
    );
  });

  it("allows the initiator to cancel", async () => {
    const repo = fakeRepo();
    const events = fakeEventBus();
    const service = new OwnershipTransferService(repo, events);

    const result = await service.cancel("transfer-1", "root-owner-1");

    expect(repo.cancelTransfer).toHaveBeenCalledWith("transfer-1");
    expect(result.status).toBe("CANCELLED");
  });

  it("allows the target to cancel (decline)", async () => {
    const repo = fakeRepo();
    const service = new OwnershipTransferService(repo, fakeEventBus());

    await service.cancel("transfer-1", "target-1");

    expect(repo.cancelTransfer).toHaveBeenCalledWith("transfer-1");
  });

  it("rejects a third party who is neither initiator nor target", async () => {
    const repo = fakeRepo();
    const service = new OwnershipTransferService(repo, fakeEventBus());

    await expect(service.cancel("transfer-1", "random-user")).rejects.toBeInstanceOf(
      OwnershipTransferForbiddenError,
    );
    expect(repo.cancelTransfer).not.toHaveBeenCalled();
  });

  it("publishes ownership.transfer.cancelled", async () => {
    const repo = fakeRepo();
    const events = fakeEventBus();
    const service = new OwnershipTransferService(repo, events);

    await service.cancel("transfer-1", "root-owner-1");

    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "ownership.transfer.cancelled" }),
    );
  });
});
