/**
 * Platform Ownership — who owns the platform as an asset (Root Owner / Owner), a domain
 * kept structurally separate from Access-level roles in user_roles/app_role (see
 * docs/architecture/PLATFORM_OWNERSHIP_ARCHITECTURE.md, PLATFORM_INITIALIZATION_ARCHITECTURE.md
 * §7). Types are defined locally here for Stage 1 (docs/architecture/STAGE1_TECHNICAL_DECISIONS.md,
 * Вопрос 4) — no shared/contracts/ file exists yet because nothing outside server/ consumes
 * this domain until a later stage.
 *
 * This port is deliberately CRUD-shaped only. It has no "claim" method: the atomic
 * check-and-insert operation for the very first Root Owner belongs to Platform
 * Initialization (Bootstrap), not to Stage 1 (see BOOTSTRAP_STAGE1_SPECIFICATION.md §4).
 */

export type PlatformOwnershipRole = "ROOT_OWNER" | "OWNER";

export interface PlatformOwnershipRecord {
  userId: string;
  role: PlatformOwnershipRole;
  createdAt: string;
  updatedAt: string;
}

export type OwnershipTransferStatus = "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";

export interface OwnershipTransferRecord {
  id: string;
  initiatorUserId: string;
  targetUserId: string;
  status: OwnershipTransferStatus;
  fullHandover: boolean;
  createdAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
}

export interface CreateOwnershipTransferInput {
  initiatorUserId: string;
  targetUserId: string;
  fullHandover: boolean;
}

export interface IPlatformOwnershipRepository {
  getByUserId(userId: string): Promise<PlatformOwnershipRecord | null>;
  create(userId: string, role: PlatformOwnershipRole): Promise<void>;
  countByRole(role: PlatformOwnershipRole): Promise<number>;
  createTransfer(input: CreateOwnershipTransferInput): Promise<OwnershipTransferRecord>;
  getTransferById(id: string): Promise<OwnershipTransferRecord | null>;
  listPendingTransfersForTarget(targetUserId: string): Promise<OwnershipTransferRecord[]>;
  /** PENDING → ACCEPTED. A single conditional UPDATE is already atomic — no RPC needed (unlike completeTransfer, below). */
  acceptTransfer(id: string): Promise<OwnershipTransferRecord>;
  /** PENDING → CANCELLED. Same single-statement atomicity as acceptTransfer. */
  cancelTransfer(id: string): Promise<OwnershipTransferRecord>;
  /**
   * ACCEPTED → COMPLETED, plus the actual ownership mutation (target becomes
   * ROOT_OWNER; initiator loses it too if fullHandover) — spans two tables, so
   * this one goes through the atomic complete_ownership_transfer() function
   * (see supabase/migrations/20260805030000_complete_ownership_transfer.sql),
   * the same reasoning as claim_root_owner() in Stage 2.
   */
  completeTransfer(id: string): Promise<OwnershipTransferRecord>;
}
