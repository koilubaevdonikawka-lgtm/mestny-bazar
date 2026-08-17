/**
 * Bootstrap (Platform Initialization) — the atomic claim operation, kept deliberately
 * separate from IPlatformOwnershipRepository (Stage 1) rather than added to it: Platform
 * Ownership's Stage 1 port/adapter/service are frozen as pure CRUD storage access; Bootstrap's
 * one-time, atomic "become the first Root Owner" operation is its own narrow contract, backed
 * by a dedicated Postgres function (see supabase/migrations/20260805020000_claim_root_owner.sql
 * and docs/architecture/BOOTSTRAP_EXECUTION_FLOW_ARCHITECTURE.md §11).
 */
export interface IBootstrapRepository {
  /** Atomically inserts the first ROOT_OWNER row for userId, or throws BootstrapAlreadyCompletedError. */
  claimRootOwner(userId: string): Promise<void>;
}
