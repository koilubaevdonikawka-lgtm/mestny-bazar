import type { CorrelationContext } from "@server/platform/observability/observability/models";

export interface CorrelationCreatedEvent {
  readonly type: "observability.correlation.created";
  readonly context: CorrelationContext;
}

export function createCorrelationCreatedEvent(context: CorrelationContext): CorrelationCreatedEvent {
  return Object.freeze({ type: "observability.correlation.created", context });
}
