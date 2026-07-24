import type { SpanDescriptor, TraceDescriptor } from "@server/platform/observability/observability/models";

/** Contract for distributed tracing metadata. */
export interface ITracingEngine {
  startTrace(name: string): TraceDescriptor;
  finishTrace(traceId: string): TraceDescriptor;
  startSpan(traceId: string, name: string, parentSpanId?: string): SpanDescriptor;
  finishSpan(spanId: string): SpanDescriptor | undefined;
  getActiveTraces(): readonly TraceDescriptor[];
}
