import type {
  AuditRecord,
  AuditRecordListParams,
  AuditRecordListResult,
  IAuditLog,
} from "@server/ports/audit-log.port";

/** In-memory audit log — no persistence, no search (foundation only). */
export class AuditLogService implements IAuditLog {
  private readonly records: AuditRecord[] = [];

  async append(record: AuditRecord): Promise<void> {
    this.records.push(record);
  }

  async list(params: AuditRecordListParams): Promise<AuditRecordListResult> {
    const filtered = this.records
      .filter((r) => !params.action || r.action === params.action)
      .filter((r) => !params.entityType || r.entityType === params.entityType)
      .filter((r) => !params.entityId || r.entityId === params.entityId)
      .filter((r) => !params.actorId || r.actorId === params.actorId)
      .filter((r) => !params.periodStart || r.occurredAt >= params.periodStart)
      .filter((r) => !params.periodEnd || r.occurredAt <= params.periodEnd)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const from = (page - 1) * pageSize;
    const items = filtered.slice(from, from + pageSize);

    return {
      items,
      total: filtered.length,
      page,
      pageSize,
      hasMore: from + items.length < filtered.length,
    };
  }
}
