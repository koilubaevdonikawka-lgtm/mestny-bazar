/** Audit record classification for observability pipelines. */
export type AuditCategory =
  | "security"
  | "access"
  | "authentication"
  | "authorization"
  | "data"
  | "system"
  | "compliance";

/** Severity level for audit records. */
export type AuditSeverity = "info" | "warning" | "critical";

export type AuditOutcome = "success" | "failure" | "denied";

/** Immutable audit record linked to security and request context. */
export interface AuditRecord {
  readonly id: string;
  readonly occurredAt: string;
  readonly category: AuditCategory;
  readonly severity: AuditSeverity;
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly identityType: string;
  readonly identityKey: string;
  readonly outcome: AuditOutcome;
  readonly message?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface CreateAuditRecordInput {
  id: string;
  occurredAt?: string;
  category: AuditCategory;
  severity?: AuditSeverity;
  action: string;
  resourceType: string;
  resourceId?: string;
  correlationId?: string;
  requestId?: string;
  identityType: string;
  identityKey: string;
  outcome: AuditOutcome;
  message?: string;
  metadata?: Readonly<Record<string, unknown>>;
}

/** Creates a frozen audit record. */
export function createAuditRecord(input: CreateAuditRecordInput): AuditRecord {
  const action = input.action?.trim();
  const resourceType = input.resourceType?.trim();

  if (!input.id?.trim() || !action || !resourceType) {
    throw new Error("AuditRecord requires id, action, and resourceType.");
  }

  if (!input.identityType?.trim() || !input.identityKey?.trim()) {
    throw new Error("AuditRecord requires identityType and identityKey.");
  }

  return Object.freeze({
    id: input.id.trim(),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    category: input.category,
    severity: input.severity ?? "info",
    action,
    resourceType,
    resourceId: input.resourceId?.trim() || undefined,
    correlationId: input.correlationId?.trim() || undefined,
    requestId: input.requestId?.trim() || undefined,
    identityType: input.identityType.trim(),
    identityKey: input.identityKey.trim(),
    outcome: input.outcome,
    message: input.message?.trim() || undefined,
    metadata: input.metadata ? Object.freeze({ ...input.metadata }) : undefined,
  });
}
