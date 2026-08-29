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
  /**
   * Human-readable name/number for the entity (order number, product name,
   * courier's name, etc.), resolved server-side — Задача №199. `null` when
   * it can't be resolved (entity deleted, or its entityType has no lookup);
   * the client renders a localized "(unavailable)" fallback using
   * `entityType` in that case, never the bare UUID.
   */
  entityName: string | null;
  /** Resolved actor display name — real only when `actorKind` is "resolved". */
  actorName: string | null;
  /**
   * Tells the client how to render the actor when `actorName` is null:
   * "system" = automated/cron/webhook-triggered action (render "Система"),
   * "unknown" = no actorId was recorded for this entry at write time
   * (render a neutral "not specified"), "unresolved" = actorId is present
   * but the profile can no longer be found (render "(unavailable)").
   * "resolved" means `actorName` is a real name.
   */
  actorKind: "resolved" | "system" | "unknown" | "unresolved";
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
