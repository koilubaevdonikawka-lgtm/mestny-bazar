import { createServerFn } from "@tanstack/react-start";
import type { AuditLogListResult } from "@shared/contracts/audit-log";
import { auditLogListParamsSchema } from "@shared/validation/audit-log.schema";

export const listAuditLogFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => auditLogListParamsSchema.parse(data))
  .handler(async ({ data }): Promise<AuditLogListResult> => {
    const { executeListAuditLog } = await import("@server/functions/logs.executor");
    return executeListAuditLog(data);
  });
