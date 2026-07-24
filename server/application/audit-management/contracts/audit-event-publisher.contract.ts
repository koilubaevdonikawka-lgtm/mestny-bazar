import type { AuditEntry } from "@server/application/audit-management/models/audit-entry.model";

export interface IAuditEventPublisher {
  publishAuditWritten(entry: AuditEntry): Promise<void>;
}
