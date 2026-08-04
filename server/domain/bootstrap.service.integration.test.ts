import { describe, expect, it } from "vitest";
import { BootstrapService } from "@server/domain/bootstrap.service";
import { BootstrapAlreadyCompletedError } from "@server/domain/bootstrap.errors";
import { PlatformOwnershipService } from "@server/domain/platform-ownership.service";
import type {
  IPlatformOwnershipRepository,
  PlatformOwnershipRecord,
  PlatformOwnershipRole,
} from "@server/ports/platform-ownership.repository";
import type { IBootstrapRepository } from "@server/ports/bootstrap.repository";

/**
 * Integration test for the domain layer: exercises BootstrapService wired to a
 * REAL PlatformOwnershipService (not a fake of it), backed by stateful, in-memory
 * repositories that model what the real schema/atomic function guarantee —
 * never a live database (ARCHITECTURE_PRINCIPLES.md CD-09). The point is to
 * verify the full ELIGIBLE → claim → COMPLETED → second-claim-rejected lifecycle
 * across service boundaries, including the single-winner guarantee under a
 * simulated concurrent claim.
 */
class InMemoryPlatformOwnershipRepository implements IPlatformOwnershipRepository {
  private records = new Map<string, PlatformOwnershipRecord>();

  async getByUserId(userId: string): Promise<PlatformOwnershipRecord | null> {
    return this.records.get(userId) ?? null;
  }

  async create(userId: string, role: PlatformOwnershipRole): Promise<void> {
    const now = new Date().toISOString();
    this.records.set(userId, { userId, role, createdAt: now, updatedAt: now });
  }

  async countByRole(role: PlatformOwnershipRole): Promise<number> {
    return [...this.records.values()].filter((r) => r.role === role).length;
  }

  async createTransfer(): Promise<never> {
    throw new Error("not used by this integration test");
  }
  async getTransferById(): Promise<null> {
    return null;
  }
  async listPendingTransfersForTarget(): Promise<never[]> {
    return [];
  }
  async acceptTransfer(): Promise<never> {
    throw new Error("not used by this integration test");
  }
  async cancelTransfer(): Promise<never> {
    throw new Error("not used by this integration test");
  }
  async completeTransfer(): Promise<never> {
    throw new Error("not used by this integration test");
  }
}

/**
 * Models the same guarantee the real claim_root_owner() Postgres function provides
 * (LOCK TABLE ... IN EXCLUSIVE MODE + INSERT ... WHERE NOT EXISTS): exactly one
 * caller ever succeeds. The check-and-set here is synchronous (no await between
 * the read and the write), which is what makes it safe under Node's single-threaded
 * event loop — this in-memory stand-in is a test convenience, not a claim that this
 * class itself is how real atomicity is achieved (it is achieved in Postgres).
 */
class InMemoryBootstrapRepository implements IBootstrapRepository {
  constructor(private readonly ownership: InMemoryPlatformOwnershipRepository) {}
  private claimed = false;

  async claimRootOwner(userId: string): Promise<void> {
    if (this.claimed) throw new BootstrapAlreadyCompletedError();
    this.claimed = true;
    await this.ownership.create(userId, "ROOT_OWNER");
  }
}

function buildService() {
  const ownershipRepo = new InMemoryPlatformOwnershipRepository();
  const platformOwnership = new PlatformOwnershipService(ownershipRepo);
  const bootstrapRepo = new InMemoryBootstrapRepository(ownershipRepo);
  const bootstrap = new BootstrapService(platformOwnership, bootstrapRepo);
  return { bootstrap, platformOwnership };
}

describe("BootstrapService — full lifecycle (integration)", () => {
  it("starts ELIGIBLE, becomes COMPLETED after a successful claim, and stays COMPLETED", async () => {
    const { bootstrap, platformOwnership } = buildService();

    await expect(bootstrap.getEligibility()).resolves.toBe("ELIGIBLE");

    await bootstrap.claim("user-1");

    await expect(bootstrap.getEligibility()).resolves.toBe("COMPLETED");
    const record = await platformOwnership.getByUserId("user-1");
    expect(record?.role).toBe("ROOT_OWNER");
  });

  it("rejects a second claim after the first has already completed Bootstrap", async () => {
    const { bootstrap } = buildService();

    await bootstrap.claim("user-1");

    await expect(bootstrap.claim("user-2")).rejects.toBeInstanceOf(BootstrapAlreadyCompletedError);
  });

  it("under a simulated concurrent claim, exactly one of two callers becomes Root Owner", async () => {
    const { bootstrap, platformOwnership } = buildService();

    const results = await Promise.allSettled([
      bootstrap.claim("user-a"),
      bootstrap.claim("user-b"),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(
      BootstrapAlreadyCompletedError,
    );

    const rootOwnerCount = await platformOwnership.countByRole("ROOT_OWNER");
    expect(rootOwnerCount).toBe(1);
  });

  it("never produces a state with more than one Root Owner, regardless of claim order", async () => {
    const { bootstrap, platformOwnership } = buildService();

    await bootstrap.claim("user-1");
    await expect(bootstrap.claim("user-2")).rejects.toBeInstanceOf(BootstrapAlreadyCompletedError);
    await expect(bootstrap.claim("user-3")).rejects.toBeInstanceOf(BootstrapAlreadyCompletedError);

    expect(await platformOwnership.countByRole("ROOT_OWNER")).toBe(1);
  });
});
