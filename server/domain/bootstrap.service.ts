import type { IBootstrapRepository } from "@server/ports/bootstrap.repository";
import type { PlatformOwnershipService } from "@server/domain/platform-ownership.service";
import type { BootstrapEligibility } from "@shared/contracts/bootstrap";

export type { BootstrapEligibility };

/**
 * Platform Initialization (Bootstrap) — the one-time process that produces the
 * platform's first Root Owner. Runs exactly once per platform lifetime; there is
 * no separate "Bootstrap Coordinator" — this single service already fulfills that
 * role (eligibility check + the one claim operation), so none is introduced here
 * (docs/architecture/BOOTSTRAP_IMPLEMENTATION_ARCHITECTURE.md, BOOTSTRAP_EXECUTION_FLOW_ARCHITECTURE.md).
 *
 * Deliberately does not depend on IMarketplaceEventBus, does not touch Role
 * Resolution, Workspace Selection, or Ownership Transfer — all out of scope for
 * this stage (see docs/architecture/BOOTSTRAP_STAGE1_SPECIFICATION.md-equivalent
 * scope note for Этап 2).
 */
export class BootstrapService {
  constructor(
    private readonly platformOwnership: PlatformOwnershipService,
    private readonly bootstrapRepo: IBootstrapRepository,
  ) {}

  /** Computed, not stored — see BootstrapEligibility. */
  async getEligibility(): Promise<BootstrapEligibility> {
    const rootOwnerCount = await this.platformOwnership.countByRole("ROOT_OWNER");
    return rootOwnerCount === 0 ? "ELIGIBLE" : "COMPLETED";
  }

  /**
   * Atomically claims Root Owner for userId. Throws BootstrapAlreadyCompletedError
   * if a Root Owner already exists — the enforcement of "at most one first claim"
   * lives entirely in the atomic DB function (claim_root_owner), not in a
   * check-then-act pair here, so this remains correct even under concurrent calls.
   */
  async claim(userId: string): Promise<void> {
    await this.bootstrapRepo.claimRootOwner(userId);
  }
}
