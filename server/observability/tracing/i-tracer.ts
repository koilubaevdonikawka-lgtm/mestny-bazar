import type { Span, SpanStatus } from "@server/observability/tracing/span";
import type { TraceContext } from "@server/observability/tracing/trace-context";

/** Distributed tracing port — implementations live in infrastructure. */
export interface ITracer {
  startSpan(name: string, parent?: TraceContext): Span;
  endSpan(span: Span, status?: SpanStatus): Span;
  currentContext(): TraceContext | undefined;
  withContext<T>(context: TraceContext, fn: () => T): T;
  inject(context: TraceContext, carrier: Record<string, string>): void;
  extract(carrier: Readonly<Record<string, string>>): TraceContext | undefined;
}
