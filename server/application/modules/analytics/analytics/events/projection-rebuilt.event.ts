export interface ProjectionRebuiltEvent {
  readonly type: "analytics.projection.rebuilt";
  readonly projectionId: string;
  readonly occurredAt: string;
}

export function createProjectionRebuiltEvent(projectionId: string): ProjectionRebuiltEvent {
  return Object.freeze({
    type: "analytics.projection.rebuilt",
    projectionId,
    occurredAt: new Date().toISOString(),
  });
}
