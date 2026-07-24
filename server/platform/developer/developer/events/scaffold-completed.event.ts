import type { ScaffoldResult } from "@server/platform/developer/developer/models";

/** Emitted when scaffolding completes. */
export interface ScaffoldCompletedEvent {
  readonly type: "developer.scaffold.completed";
  readonly result: ScaffoldResult;
}

export function createScaffoldCompletedEvent(result: ScaffoldResult): ScaffoldCompletedEvent {
  return Object.freeze({ type: "developer.scaffold.completed", result });
}
