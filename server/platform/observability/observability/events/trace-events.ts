import type { TraceDescriptor } from "@server/platform/observability/observability/models";

export interface TraceStartedEvent {
  readonly type: "observability.trace.started";
  readonly trace: TraceDescriptor;
}

export function createTraceStartedEvent(trace: TraceDescriptor): TraceStartedEvent {
  return Object.freeze({ type: "observability.trace.started", trace });
}

export interface TraceCompletedEvent {
  readonly type: "observability.trace.completed";
  readonly trace: TraceDescriptor;
}

export function createTraceCompletedEvent(trace: TraceDescriptor): TraceCompletedEvent {
  return Object.freeze({ type: "observability.trace.completed", trace });
}
