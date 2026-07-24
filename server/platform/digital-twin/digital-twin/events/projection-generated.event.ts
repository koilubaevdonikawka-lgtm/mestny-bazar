import type { ProjectionResult } from "@server/platform/digital-twin/digital-twin/models";

export interface ProjectionGeneratedEvent {
  readonly type: "digital-twin.projection.generated";
  readonly result: ProjectionResult;
}

export function createProjectionGeneratedEvent(result: ProjectionResult): ProjectionGeneratedEvent {
  return Object.freeze({ type: "digital-twin.projection.generated", result });
}
