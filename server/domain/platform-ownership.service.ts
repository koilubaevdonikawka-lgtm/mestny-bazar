import type {
  CreateOwnershipTransferInput,
  IPlatformOwnershipRepository,
  OwnershipTransferRecord,
  PlatformOwnershipRecord,
  PlatformOwnershipRole,
} from "@server/ports/platform-ownership.repository";

/**
 * Stage 1 — thin delegation over the repository, no business rules yet. The
 * "minimum one Root Owner" invariant and the atomic claim operation belong to
 * Platform Initialization (Bootstrap), not to this service (see
 * docs/architecture/BOOTSTRAP_STAGE1_SPECIFICATION.md §4). No IMarketplaceEventBus
 * dependency here — there is nothing to publish yet (system.bootstrap.completed
 * and ownership.transfer.* are introduced in later stages), matching the existing
 * no-event-bus pattern (e.g. SupplierService) rather than UserAdminService's.
 */
export class PlatformOwnershipService {
  constructor(private readonly ownership: IPlatformOwnershipRepository) {}

  async getByUserId(userId: string): Promise<PlatformOwnershipRecord | null> {
    return this.ownership.getByUserId(userId);
  }

  async create(userId: string, role: PlatformOwnershipRole): Promise<void> {
    return this.ownership.create(userId, role);
  }

  async countByRole(role: PlatformOwnershipRole): Promise<number> {
    return this.ownership.countByRole(role);
  }

  async createTransfer(input: CreateOwnershipTransferInput): Promise<OwnershipTransferRecord> {
    return this.ownership.createTransfer(input);
  }

  async getTransferById(id: string): Promise<OwnershipTransferRecord | null> {
    return this.ownership.getTransferById(id);
  }

  async listPendingTransfersForTarget(targetUserId: string): Promise<OwnershipTransferRecord[]> {
    return this.ownership.listPendingTransfersForTarget(targetUserId);
  }
}
