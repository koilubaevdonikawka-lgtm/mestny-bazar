import type { AuditEntry } from "@server/application/audit-management/models/audit-entry.model";

export interface IAuditRetentionPolicy {
  shouldRetain(entry: AuditEntry): boolean;
  getMaxEntries(): number;
}
