import type { IAuditEventPublisher } from "@server/application/audit-management/contracts/audit-event-publisher.contract";
import type { AuditEntry } from "@server/application/audit-management/models/audit-entry.model";

/** No-op audit event publisher for future SIEM / monitoring integrations. */
export class NoopAuditEventPublisher implements IAuditEventPublisher {
  async publishAuditWritten(_entry: AuditEntry): Promise<void> {
    return;
  }
}
