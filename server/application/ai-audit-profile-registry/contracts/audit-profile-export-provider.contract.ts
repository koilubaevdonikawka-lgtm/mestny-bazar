import type { AuditProfile } from "@server/application/ai-audit-profile-registry/models/audit-profile.model";

/** Future integration point for audit profile export. Not wired yet. */
export interface IAuditProfileExportProvider {
  exportProfiles(auditProfiles: readonly AuditProfile[]): Promise<string>;
}
