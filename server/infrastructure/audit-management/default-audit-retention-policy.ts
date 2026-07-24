import type { IAuditRetentionPolicy } from "@server/application/audit-management/contracts/audit-retention-policy.contract";
import type { AuditEntry } from "@server/application/audit-management/models/audit-entry.model";

/** Default in-memory retention policy. */
export class DefaultAuditRetentionPolicy implements IAuditRetentionPolicy {
  constructor(private readonly maxEntries = 10_000) {}

  shouldRetain(entry: AuditEntry): boolean {
    return (
      entry.userId.trim().length > 0 &&
      entry.module.trim().length > 0 &&
      entry.eventType.trim().length > 0 &&
      entry.message.trim().length > 0
    );
  }

  getMaxEntries(): number {
    return this.maxEntries;
  }
}
