/** Span metadata within a trace. */
export interface SpanDescriptor {
  readonly id: string;
  readonly traceId: string;
  readonly name: string;
  readonly parentSpanId?: string;
  readonly startedAt: string;
  readonly finishedAt?: string;
}

export function createSpanDescriptor(input: {
  id?: string;
  traceId: string;
  name: string;
  parentSpanId?: string;
  finishedAt?: string;
}): SpanDescriptor {
  return Object.freeze({
    id: input.id ?? `span-${Date.now()}`,
    traceId: input.traceId.trim(),
    name: input.name.trim(),
    parentSpanId: input.parentSpanId?.trim() || undefined,
    startedAt: new Date().toISOString(),
    finishedAt: input.finishedAt,
  });
}
