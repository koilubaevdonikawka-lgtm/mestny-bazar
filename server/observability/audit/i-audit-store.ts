import type { AuditRecord } from "@server/observability/audit/audit-record";

export interface AuditQuery {
  readonly correlationId?: string;
  readonly identityKey?: string;
  readonly category?: AuditRecord["category"];
  readonly from?: string;
  readonly to?: string;
  readonly limit?: number;
}

/** Persistence port for audit records — implementations live in infrastructure. */
export interface IAuditStore {
  append(record: AuditRecord): Promise<void>;
  appendMany(records: readonly AuditRecord[]): Promise<void>;
  query(filter: AuditQuery): Promise<readonly AuditRecord[]>;
}
