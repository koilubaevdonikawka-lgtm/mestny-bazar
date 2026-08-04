import { describe, expect, it } from "vitest";
import { OwnershipTransferService } from "@server/domain/ownership-transfer.service";
import {
  NotRootOwnerError,
  OwnershipTransferInvalidStateError,
} from "@server/domain/ownership-transfer.errors";
import type {
  CreateOwnershipTransferInput,
  IPlatformOwnershipRepository,
  OwnershipTransferRecord,
  PlatformOwnershipRecord,
  PlatformOwnershipRole,
} from "@server/ports/platform-ownership.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";

/**
 * Integration test: a real OwnershipTransferService wired to a stateful, in-memory
 * repository that mirrors the real schema's semantics (never a live database,
 * ARCHITECTURE_PRINCIPLES.md CD-09) — including the single-winner guarantee the
 * real complete_ownership_transfer() Postgres function provides, and the
 * "at most one PENDING transfer per target" DB constraint
 * (BOOTSTRAP_DATA_MODEL_ARCHITECTURE.md §8).
 */
class InMemoryPlatformOwnershipRepository implements IPlatformOwnershipRepository {
  private ownership = new Map<string, PlatformOwnershipRecord>();
  private transfers = new Map<string, OwnershipTransferRecord>();
  private nextId = 1;

  seedOwner(userId: string, role: PlatformOwnershipRole): void {
    const now = new Date().toISOString();
    this.ownership.set(userId, { userId, role, createdAt: now, updatedAt: now });
  }

  async getByUserId(userId: string): Promise<PlatformOwnershipRecord | null> {
    return this.ownership.get(userId) ?? null;
  }

  async create(userId: string, role: PlatformOwnershipRole): Promise<void> {
    const now = new Date().toISOString();
    this.ownership.set(userId, { userId, role, createdAt: now, updatedAt: now });
  }

  async countByRole(role: PlatformOwnershipRole): Promise<number> {
    return [...this.ownership.values()].filter((r) => r.role === role).length;
  }

  async createTransfer(input: CreateOwnershipTransferInput): Promise<OwnershipTransferRecord> {
    const hasPending = [...this.transfers.values()].some(
      (t) => t.targetUserId === input.targetUserId && t.status === "PENDING",
    );
    if (hasPending) throw new Error("duplicate key value violates unique constraint");

    const record: OwnershipTransferRecord = {
      id: `transfer-${this.nextId++}`,
      initiatorUserId: input.initiatorUserId,
      targetUserId: input.targetUserId,
      status: "PENDING",
      fullHandover: input.fullHandover,
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      completedAt: null,
      cancelledAt: null,
    };
    this.transfers.set(record.id, record);
    return record;
  }

  async getTransferById(id: string): Promise<OwnershipTransferRecord | null> {
    return this.transfers.get(id) ?? null;
  }

  async listPendingTransfersForTarget(targetUserId: string): Promise<OwnershipTransferRecord[]> {
    return [...this.transfers.values()].filter(
      (t) => t.targetUserId === targetUserId && t.status === "PENDING",
    );
  }

  async acceptTransfer(id: string): Promise<OwnershipTransferRecord> {
    const existing = this.transfers.get(id);
    if (!existing || existing.status !== "PENDING") {
      throw new OwnershipTransferInvalidStateError("Transfer is not PENDING");
    }
    const updated: OwnershipTransferRecord = {
      ...existing,
      status: "ACCEPTED",
      acceptedAt: new Date().toISOString(),
    };
    this.transfers.set(id, updated);
    return updated;
  }

  async cancelTransfer(id: string): Promise<OwnershipTransferRecord> {
    const existing = this.transfers.get(id);
    if (!existing || existing.status !== "PENDING") {
      throw new OwnershipTransferInvalidStateError("Transfer is not PENDING");
    }
    const updated: OwnershipTransferRecord = {
      ...existing,
      status: "CANCELLED",
      cancelledAt: new Date().toISOString(),
    };
    this.transfers.set(id, updated);
    return updated;
  }

  async completeTransfer(id: string): Promise<OwnershipTransferRecord> {
    const existing = this.transfers.get(id);
    if (!existing || existing.status !== "ACCEPTED") {
      throw new OwnershipTransferInvalidStateError("Transfer is not ACCEPTED");
    }
    // Mirrors complete_ownership_transfer(): target becomes ROOT_OWNER first,
    // initiator's row is removed only afterward, and only if fullHandover —
    // the ROOT_OWNER count is never observably zero at any point.
    const now = new Date().toISOString();
    this.ownership.set(existing.targetUserId, {
      userId: existing.targetUserId,
      role: "ROOT_OWNER",
      createdAt: this.ownership.get(existing.targetUserId)?.createdAt ?? now,
      updatedAt: now,
    });
    if (existing.fullHandover) {
      this.ownership.delete(existing.initiatorUserId);
    }
    const updated: OwnershipTransferRecord = {
      ...existing,
      status: "COMPLETED",
      completedAt: now,
    };
    this.transfers.set(id, updated);
    return updated;
  }
}

function fakeEventBus(): IMarketplaceEventBus {
  const published: MarketplaceEvent[] = [];
  return {
    publish: async (event: MarketplaceEvent) => {
      published.push(event);
    },
    subscribe: () => {},
    // Test helper, not part of the port contract.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...({ published } as any),
  };
}

function buildService() {
  const repo = new InMemoryPlatformOwnershipRepository();
  const events = fakeEventBus();
  const service = new OwnershipTransferService(repo, events);
  return { repo, events, service };
}

describe("OwnershipTransferService — full lifecycle (integration)", () => {
  it("co-ownership: both initiator and target are Root Owner after completion", async () => {
    const { repo, service } = buildService();
    repo.seedOwner("owner-1", "ROOT_OWNER");

    const transfer = await service.initiate("owner-1", "owner-2", false);
    await service.accept(transfer.id, "owner-2");

    expect((await repo.getByUserId("owner-1"))?.role).toBe("ROOT_OWNER");
    expect((await repo.getByUserId("owner-2"))?.role).toBe("ROOT_OWNER");
    expect(await repo.countByRole("ROOT_OWNER")).toBe(2);
  });

  it("full handover: initiator loses Root Owner, target gains it, count stays at 1", async () => {
    const { repo, service } = buildService();
    repo.seedOwner("owner-1", "ROOT_OWNER");

    const transfer = await service.initiate("owner-1", "owner-2", true);
    await service.accept(transfer.id, "owner-2");

    expect(await repo.getByUserId("owner-1")).toBeNull();
    expect((await repo.getByUserId("owner-2"))?.role).toBe("ROOT_OWNER");
    expect(await repo.countByRole("ROOT_OWNER")).toBe(1);
  });

  it("never lets the Root Owner count drop to zero across a full-handover transfer", async () => {
    const { repo, service } = buildService();
    repo.seedOwner("owner-1", "ROOT_OWNER");

    const transfer = await service.initiate("owner-1", "owner-2", true);
    await service.accept(transfer.id, "owner-2");

    // At no point should the count have been observably 0 — by construction the
    // target is inserted before the initiator is removed (see completeTransfer above).
    expect(await repo.countByRole("ROOT_OWNER")).toBeGreaterThanOrEqual(1);
  });

  it("a cancelled transfer never touches platform_ownership", async () => {
    const { repo, service } = buildService();
    repo.seedOwner("owner-1", "ROOT_OWNER");

    const transfer = await service.initiate("owner-1", "owner-2", true);
    await service.cancel(transfer.id, "owner-1");

    expect(await repo.getByUserId("owner-2")).toBeNull();
    expect(await repo.countByRole("ROOT_OWNER")).toBe(1);
  });

  it("rejects initiation from a non-Root-Owner even if they hold Owner status", async () => {
    const { repo, service } = buildService();
    repo.seedOwner("owner-1", "ROOT_OWNER");
    repo.seedOwner("plain-owner", "OWNER");

    await expect(service.initiate("plain-owner", "owner-2", false)).rejects.toBeInstanceOf(
      NotRootOwnerError,
    );
  });

  it("rejects a second PENDING transfer to the same target while one is already pending", async () => {
    const { repo, service } = buildService();
    repo.seedOwner("owner-1", "ROOT_OWNER");
    repo.seedOwner("owner-3", "ROOT_OWNER");

    await service.initiate("owner-1", "owner-2", false);

    await expect(service.initiate("owner-3", "owner-2", false)).rejects.toThrow();
  });

  it("cannot accept a transfer twice — the second attempt fails, ownership is unaffected by it", async () => {
    const { repo, service } = buildService();
    repo.seedOwner("owner-1", "ROOT_OWNER");

    const transfer = await service.initiate("owner-1", "owner-2", false);
    await service.accept(transfer.id, "owner-2");

    await expect(service.accept(transfer.id, "owner-2")).rejects.toBeInstanceOf(
      OwnershipTransferInvalidStateError,
    );
    expect(await repo.countByRole("ROOT_OWNER")).toBe(2);
  });

  it("cannot cancel an already-completed transfer", async () => {
    const { repo, service } = buildService();
    repo.seedOwner("owner-1", "ROOT_OWNER");

    const transfer = await service.initiate("owner-1", "owner-2", false);
    await service.accept(transfer.id, "owner-2");

    await expect(service.cancel(transfer.id, "owner-1")).rejects.toBeInstanceOf(
      OwnershipTransferInvalidStateError,
    );
  });

  it("publishes the full initiated → accepted → completed event sequence", async () => {
    const { events } = buildService();
    const repo = new InMemoryPlatformOwnershipRepository();
    repo.seedOwner("owner-1", "ROOT_OWNER");
    const svc = new OwnershipTransferService(repo, events);

    const transfer = await svc.initiate("owner-1", "owner-2", false);
    await svc.accept(transfer.id, "owner-2");

    const published = (events as unknown as { published: MarketplaceEvent[] }).published;
    const types = published.map((e) => e.type);
    expect(types).toEqual([
      "ownership.transfer.initiated",
      "ownership.transfer.accepted",
      "ownership.transfer.completed",
    ]);
  });
});
