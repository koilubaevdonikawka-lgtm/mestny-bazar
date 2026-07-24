/** Marketplace actions recorded by the audit log. */
export type AuditAction = "order.created";

export interface AuditRecord {
  id: string;
  action: AuditAction;
  occurredAt: string;
  entityType: string;
  entityId: string;
  actorId: string | null;
  payload: Record<string, unknown>;
}

export interface IAuditLog {
  append(record: AuditRecord): Promise<void>;
}
