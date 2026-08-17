import type { IAuditLog } from "@server/ports/audit-log.port";
import type { AuditLogListParams, AuditLogListResult } from "@shared/contracts/audit-log";

/** logs.md — thin read-only query surface over IAuditLog, for the admin "Лента событий" screen. */
export class AuditLogQueryService {
  constructor(private readonly auditLog: IAuditLog) {}

  async list(params: AuditLogListParams): Promise<AuditLogListResult> {
    return this.auditLog.list(params);
  }
}
