import { createTraceContext, type TraceContext } from "@server/observability/tracing/trace-context";
import { SpanId } from "@server/observability/tracing/span-id";

/** Creates a child trace context from a parent span. */
export function createChildTraceContext(parent: TraceContext): TraceContext {
  return createTraceContext({
    traceId: parent.traceId,
    spanId: SpanId.generate(),
    parentSpanId: parent.spanId,
    sampled: parent.sampled,
    traceFlags: parent.traceFlags,
    baggage: parent.baggage,
  });
}
