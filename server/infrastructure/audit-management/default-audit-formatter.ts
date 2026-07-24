import type { IAuditFormatter } from "@server/application/audit-management/contracts/audit-formatter.contract";
import type { WriteAuditEntryInput } from "@server/application/audit-management/models/audit-entry.model";

/** Default audit message formatter. */
export class DefaultAuditFormatter implements IAuditFormatter {
  format(input: WriteAuditEntryInput): string {
    const resource = input.resourceId ? ` resource=${input.resourceId}` : "";
    return `[${input.module}] ${input.eventType} by ${input.userId}${resource}: ${input.message}`;
  }
}
