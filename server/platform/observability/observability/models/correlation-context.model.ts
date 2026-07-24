/** Correlation context for distributed observability. */
export interface CorrelationContext {
  readonly correlationId: string;
  readonly requestId?: string;
  readonly operationId?: string;
  readonly sessionId?: string;
  readonly createdAt: string;
}

export function createCorrelationContext(input: {
  correlationId?: string;
  requestId?: string;
  operationId?: string;
  sessionId?: string;
}): CorrelationContext {
  return Object.freeze({
    correlationId: input.correlationId ?? `corr-${Date.now()}`,
    requestId: input.requestId?.trim() || undefined,
    operationId: input.operationId?.trim() || undefined,
    sessionId: input.sessionId?.trim() || undefined,
    createdAt: new Date().toISOString(),
  });
}
