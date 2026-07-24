import type { AuditProfile } from "@server/application/ai-audit-profile-registry/models/audit-profile.model";

/** Future integration point for audit profile synchronization. Not wired yet. */
export interface IAuditProfileSynchronizationProvider {
  synchronize(auditProfiles: readonly AuditProfile[]): Promise<void>;
}
