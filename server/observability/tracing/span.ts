import type { TraceContext } from "@server/observability/tracing/trace-context";

export type SpanStatus = "unset" | "ok" | "error";

/** Immutable span model — OpenTelemetry-compatible fields without OTel dependency. */
export interface Span {
  readonly name: string;
  readonly context: TraceContext;
  readonly startTime: string;
  readonly endTime?: string;
  readonly status: SpanStatus;
  readonly kind?: "internal" | "server" | "client" | "producer" | "consumer";
  readonly attributes?: Readonly<Record<string, unknown>>;
  readonly events?: readonly SpanEvent[];
}

export interface SpanEvent {
  readonly name: string;
  readonly timestamp: string;
  readonly attributes?: Readonly<Record<string, unknown>>;
}

export interface CreateSpanInput {
  name: string;
  context: TraceContext;
  startTime?: string;
  status?: SpanStatus;
  kind?: Span["kind"];
  attributes?: Readonly<Record<string, unknown>>;
}

/** Creates an immutable span. */
export function createSpan(input: CreateSpanInput): Span {
  const name = input.name?.trim();
  if (!name) {
    throw new Error("Span requires a non-empty name.");
  }

  return Object.freeze({
    name,
    context: input.context,
    startTime: input.startTime ?? new Date().toISOString(),
    status: input.status ?? "unset",
    kind: input.kind,
    attributes: input.attributes ? Object.freeze({ ...input.attributes }) : undefined,
    events: undefined,
  });
}

/** Returns a ended copy of the span. */
export function endSpan(span: Span, status: SpanStatus = "ok"): Span {
  return Object.freeze({
    ...span,
    endTime: new Date().toISOString(),
    status,
  });
}
