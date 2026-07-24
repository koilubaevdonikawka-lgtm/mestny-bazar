import { SpanId } from "@server/observability/tracing/span-id";
import { TraceId } from "@server/observability/tracing/trace-id";

/** W3C-compatible distributed trace context — OpenTelemetry-ready shape. */
export interface TraceContext {
  readonly traceId: TraceId;
  readonly spanId: SpanId;
  readonly parentSpanId?: SpanId;
  readonly sampled: boolean;
  readonly traceFlags?: string;
  readonly baggage?: Readonly<Record<string, string>>;
}

export interface CreateTraceContextInput {
  traceId: TraceId;
  spanId: SpanId;
  parentSpanId?: SpanId;
  sampled?: boolean;
  traceFlags?: string;
  baggage?: Readonly<Record<string, string>>;
}

/** Creates an immutable trace context. */
export function createTraceContext(input: CreateTraceContextInput): TraceContext {
  return Object.freeze({
    traceId: input.traceId,
    spanId: input.spanId,
    parentSpanId: input.parentSpanId,
    sampled: input.sampled ?? true,
    traceFlags: input.traceFlags?.trim() || undefined,
    baggage: input.baggage ? Object.freeze({ ...input.baggage }) : undefined,
  });
}

/** Generates a new root trace context. */
export function createRootTraceContext(sampled = true): TraceContext {
  return createTraceContext({
    traceId: TraceId.generate(),
    spanId: SpanId.generate(),
    sampled,
  });
}

/** Serializes trace context to W3C traceparent-compatible fields. */
export function traceContextToCarrier(context: TraceContext): Readonly<Record<string, string>> {
  const flags = context.sampled ? "01" : "00";
  return Object.freeze({
    traceparent: `00-${context.traceId.toString()}-${context.spanId.toString()}-${flags}`,
    ...(context.baggage ? { baggage: serializeBaggage(context.baggage) } : {}),
  });
}

function serializeBaggage(baggage: Readonly<Record<string, string>>): string {
  return Object.entries(baggage)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join(",");
}
