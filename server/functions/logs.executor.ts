import type { AuditLogListParams, AuditLogListResult } from "@shared/contracts/audit-log";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

const MODULE = "logs";

export async function executeListAuditLog(
  params?: AuditLogListParams,
): Promise<AuditLogListResult> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().auditLogQueryService.list(params ?? {});
}
