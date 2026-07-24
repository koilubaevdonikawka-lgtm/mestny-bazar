import type { SecurityContext } from "@server/security/context";

/** Contextual metadata captured alongside an audit record. */
export interface AuditContext {
  readonly security: SecurityContext;
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly tenantId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Creates an immutable audit context snapshot. */
export function createAuditContext(input: AuditContext): AuditContext {
  return Object.freeze({
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId?.trim() || undefined,
    requestId: input.requestId?.trim() || input.security.requestId,
    correlationId: input.correlationId?.trim() || input.security.correlationId,
    tenantId: input.tenantId?.trim() || input.security.tenantId,
    security: input.security,
    metadata: input.metadata ? Object.freeze({ ...input.metadata }) : undefined,
  });
}
