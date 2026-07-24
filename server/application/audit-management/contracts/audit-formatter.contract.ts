import type { WriteAuditEntryInput } from "@server/application/audit-management/models/audit-entry.model";

export interface IAuditFormatter {
  format(input: WriteAuditEntryInput): string;
}
