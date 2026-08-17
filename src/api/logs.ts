import type { AuditLogListParams, AuditLogListResult } from "@shared/contracts/audit-log";
import { listAuditLogFn } from "@/api/logs.functions";

export async function listAuditLog(params?: AuditLogListParams): Promise<AuditLogListResult> {
  return listAuditLogFn({ data: params });
}
