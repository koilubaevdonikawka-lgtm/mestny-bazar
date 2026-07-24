import type { ITracingEngine } from "@server/platform/observability/observability/contracts";
import type { ISamplingPolicyEngine } from "@server/platform/observability/observability/contracts";
import {
  createSpanDescriptor,
  createTraceDescriptor,
  type SpanDescriptor,
  type TraceDescriptor,
} from "@server/platform/observability/observability/models";
import {
  createTraceCompletedEvent,
  createTraceStartedEvent,
} from "@server/platform/observability/observability/events";

/** Distributed tracing metadata engine (no external exporters). */
export class TracingEngine implements ITracingEngine {
  private readonly traces = new Map<string, TraceDescriptor>();
  private readonly spans = new Map<string, SpanDescriptor>();

  constructor(private readonly samplingEngine: ISamplingPolicyEngine) {}

  startTrace(name: string): TraceDescriptor {
    const trace = createTraceDescriptor({ name, status: "active", spanCount: 0 });
    this.traces.set(trace.id, trace);
    createTraceStartedEvent(trace);
    return trace;
  }

  finishTrace(traceId: string): TraceDescriptor {
    const existing = this.traces.get(traceId.trim());
    if (!existing) {
      throw new Error(`Trace not found: ${traceId}`);
    }

    const spanCount = [...this.spans.values()].filter((span) => span.traceId === existing.id).length;
    const finished = createTraceDescriptor({
      id: existing.id,
      name: existing.name,
      status: "completed",
      spanCount,
      startedAt: existing.startedAt,
      finishedAt: new Date().toISOString(),
    });
    this.traces.set(existing.id, finished);
    createTraceCompletedEvent(finished);
    return finished;
  }

  startSpan(traceId: string, name: string, parentSpanId?: string): SpanDescriptor {
    const trace = this.traces.get(traceId.trim());
    if (!trace) {
      throw new Error(`Trace not found: ${traceId}`);
    }

    if (!this.samplingEngine.shouldSample("default-always", traceId)) {
      throw new Error(`Trace sampling rejected: ${traceId}`);
    }

    const span = createSpanDescriptor({ traceId, name, parentSpanId });
    this.spans.set(span.id, span);
    return span;
  }

  finishSpan(spanId: string): SpanDescriptor | undefined {
    const span = this.spans.get(spanId.trim());
    if (!span) {
      return undefined;
    }
    const finished = createSpanDescriptor({
      id: span.id,
      traceId: span.traceId,
      name: span.name,
      parentSpanId: span.parentSpanId,
      finishedAt: new Date().toISOString(),
    });
    this.spans.set(span.id, finished);
    return finished;
  }

  getActiveTraces(): readonly TraceDescriptor[] {
    return Object.freeze(
      [...this.traces.values()].filter((trace) => trace.status === "active"),
    );
  }
}
