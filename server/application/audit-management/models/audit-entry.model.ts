/** Audit event record. */
export interface AuditEntry {
  readonly auditId: string;
  readonly userId: string;
  readonly module: string;
  readonly eventType: string;
  readonly resourceId: string | null;
  readonly message: string;
  readonly formattedMessage: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly occurredAt: string;
}

export function createAuditEntry(input: {
  auditId: string;
  userId: string;
  module: string;
  eventType: string;
  resourceId?: string | null;
  message: string;
  formattedMessage: string;
  metadata?: Readonly<Record<string, string>>;
  occurredAt?: string;
}): AuditEntry {
  return Object.freeze({
    auditId: input.auditId.trim(),
    userId: input.userId.trim(),
    module: input.module.trim(),
    eventType: input.eventType.trim(),
    resourceId: input.resourceId?.trim() ?? null,
    message: input.message,
    formattedMessage: input.formattedMessage,
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  });
}

export interface AuditLogResult {
  readonly entries: readonly AuditEntry[];
  readonly total: number;
}

export interface WriteAuditEntryInput {
  readonly userId: string;
  readonly module: string;
  readonly eventType: string;
  readonly resourceId?: string | null;
  readonly message: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface AuditDateRangeQuery {
  readonly from: string;
  readonly to: string;
}
