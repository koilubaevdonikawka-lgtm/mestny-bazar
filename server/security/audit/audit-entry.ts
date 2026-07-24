import type { AuditContext } from "@server/security/audit/audit-context";

export type AuditOutcome = "success" | "failure" | "denied";

/** Immutable audit log entry — domain model for security events. */
export interface AuditEntry {
  readonly id: string;
  readonly occurredAt: string;
  readonly outcome: AuditOutcome;
  readonly context: AuditContext;
  readonly message?: string;
}

/** Creates a frozen audit entry. */
export function createAuditEntry(input: AuditEntry): AuditEntry {
  return Object.freeze({
    id: input.id,
    occurredAt: input.occurredAt,
    outcome: input.outcome,
    context: input.context,
    message: input.message?.trim() || undefined,
  });
}

/** Port for publishing audit entries — implementation lives in infrastructure. */
export interface IAuditPublisher {
  publish(entry: AuditEntry): Promise<void>;
  publishMany(entries: readonly AuditEntry[]): Promise<void>;
}

/** Alias for the audit publisher port. */
export type AuditPublisher = IAuditPublisher;
