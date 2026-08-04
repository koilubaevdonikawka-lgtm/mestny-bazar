import type {
  IPlatformOwnershipRepository,
  OwnershipTransferRecord,
} from "@server/ports/platform-ownership.repository";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { OwnershipTransferDTO } from "@shared/contracts/ownership-transfer";
import {
  NotRootOwnerError,
  OwnershipTransferForbiddenError,
  OwnershipTransferNotFoundError,
  SelfTransferError,
} from "@server/domain/ownership-transfer.errors";

function toDTO(record: OwnershipTransferRecord): OwnershipTransferDTO {
  return { ...record };
}

/**
 * Transfer Root Ownership — a stateful, dual-consent business process
 * (PENDING → ACCEPTED → COMPLETED, or PENDING → CANCELLED), never a single-row
 * mutation (docs/architecture/PLATFORM_OWNERSHIP_ARCHITECTURE.md §7, §12).
 * Deliberately part of the Platform Ownership domain (reuses
 * IPlatformOwnershipRepository directly, does not depend on BootstrapService —
 * Bootstrap is not touched by this stage at all).
 *
 * Authorization here is NOT PermissionPolicyService/Rule Engine — Ownership does
 * not go through it (PLATFORM_OWNERSHIP_ARCHITECTURE.md §3); "who may initiate/
 * accept/cancel" is enforced directly in this service instead.
 */
export class OwnershipTransferService {
  constructor(
    private readonly ownership: IPlatformOwnershipRepository,
    private readonly marketplaceEvents: IMarketplaceEventBus,
  ) {}

  /** Only a current Root Owner may initiate (PLATFORM_OWNERSHIP_ARCHITECTURE.md §7). */
  async initiate(
    initiatorUserId: string,
    targetUserId: string,
    fullHandover: boolean,
  ): Promise<OwnershipTransferDTO> {
    if (initiatorUserId === targetUserId) throw new SelfTransferError();

    const initiatorRecord = await this.ownership.getByUserId(initiatorUserId);
    if (initiatorRecord?.role !== "ROOT_OWNER") throw new NotRootOwnerError();

    const transfer = await this.ownership.createTransfer({
      initiatorUserId,
      targetUserId,
      fullHandover,
    });

    await this.marketplaceEvents.publish({
      type: "ownership.transfer.initiated",
      transfer: toDTO(transfer),
    });

    return toDTO(transfer);
  }

  /**
   * Only the target may accept. Per the architecture, acceptance and completion
   * happen together as one user-facing action — accept() calls complete()
   * internally rather than leaving the caller to remember the second step.
   */
  async accept(transferId: string, actingUserId: string): Promise<OwnershipTransferDTO> {
    const existing = await this.ownership.getTransferById(transferId);
    if (!existing) throw new OwnershipTransferNotFoundError();
    if (existing.targetUserId !== actingUserId) {
      throw new OwnershipTransferForbiddenError("Only the target may accept this transfer");
    }

    const accepted = await this.ownership.acceptTransfer(transferId);
    await this.marketplaceEvents.publish({
      type: "ownership.transfer.accepted",
      transfer: toDTO(accepted),
    });

    return this.complete(transferId);
  }

  /**
   * The atomic ownership mutation (target becomes ROOT_OWNER; initiator loses
   * it too if fullHandover) — enforced entirely inside the DB function, not by
   * a check-then-act pair here (same reasoning as BootstrapService.claim()).
   */
  async complete(transferId: string): Promise<OwnershipTransferDTO> {
    const completed = await this.ownership.completeTransfer(transferId);
    await this.marketplaceEvents.publish({
      type: "ownership.transfer.completed",
      transfer: toDTO(completed),
    });
    return toDTO(completed);
  }

  /** Either party may cancel their own pending transfer (initiator changes their mind, or target declines). */
  async cancel(transferId: string, actingUserId: string): Promise<OwnershipTransferDTO> {
    const existing = await this.ownership.getTransferById(transferId);
    if (!existing) throw new OwnershipTransferNotFoundError();
    if (existing.initiatorUserId !== actingUserId && existing.targetUserId !== actingUserId) {
      throw new OwnershipTransferForbiddenError(
        "Only the initiator or target may cancel this transfer",
      );
    }

    const cancelled = await this.ownership.cancelTransfer(transferId);
    await this.marketplaceEvents.publish({
      type: "ownership.transfer.cancelled",
      transfer: toDTO(cancelled),
    });

    return toDTO(cancelled);
  }
}
