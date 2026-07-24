import type { ITracer } from "@server/observability/tracing";

/** Provides tracers for distributed tracing integration. */
export interface ITraceProvider {
  getTracer(scope: string): ITracer;
}
