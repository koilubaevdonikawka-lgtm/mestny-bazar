export interface MetricsUpdatedEvent {
  readonly type: "analytics.metrics.updated";
  readonly projectionId: string;
  readonly eventName: string;
  readonly occurredAt: string;
}

export function createMetricsUpdatedEvent(input: {
  projectionId: string;
  eventName: string;
}): MetricsUpdatedEvent {
  return Object.freeze({
    type: "analytics.metrics.updated",
    projectionId: input.projectionId,
    eventName: input.eventName,
    occurredAt: new Date().toISOString(),
  });
}
