import type { AuditRecord, IAuditLog } from "@server/ports/audit-log.port";

/** In-memory audit log — no persistence, no search (foundation only). */
export class AuditLogService implements IAuditLog {
  private readonly records: AuditRecord[] = [];

  async append(record: AuditRecord): Promise<void> {
    this.records.push(record);
  }
}
