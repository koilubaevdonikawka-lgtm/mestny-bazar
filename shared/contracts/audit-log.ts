/** Matches the audit_log.payload jsonb column — must stay JSON-serializable for createServerFn. */
export type AuditLogPayloadValue =
  | string
  | number
  | boolean
  | null
  | AuditLogPayloadValue[]
  | { [key: string]: AuditLogPayloadValue };

export interface AuditLogEntryDTO {
  id: string;
  action: string;
  occurredAt: string;
  entityType: string;
  entityId: string;
  actorId: string | null;
  payload: Record<string, AuditLogPayloadValue>;
}

export interface AuditLogListParams {
  action?: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  periodStart?: string;
  periodEnd?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditLogListResult {
  items: AuditLogEntryDTO[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
