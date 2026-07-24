import type { InspectionResult } from "@server/platform/developer/developer/models";

/** Emitted when an inspection completes. */
export interface InspectionCompletedEvent {
  readonly type: "developer.inspection.completed";
  readonly result: InspectionResult;
}

export function createInspectionCompletedEvent(result: InspectionResult): InspectionCompletedEvent {
  return Object.freeze({ type: "developer.inspection.completed", result });
}
