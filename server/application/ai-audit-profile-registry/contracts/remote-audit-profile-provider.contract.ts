import type { AuditProfile } from "@server/application/ai-audit-profile-registry/models/audit-profile.model";

/** Future integration point for external audit profile providers. Not wired yet. */
export interface IRemoteAuditProfileProvider {
  fetchRemote(auditProfileId: string): Promise<AuditProfile | null>;
  pushRemote(auditProfile: AuditProfile): Promise<void>;
}
