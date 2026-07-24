import type { MaintenanceResult } from "@server/platform/operations/operations/models";

/** Emitted when retention policy application completes. */
export interface RetentionCompletedEvent {
  readonly type: "operations.retention.completed";
  readonly result: MaintenanceResult;
}

export function createRetentionCompletedEvent(
  result: MaintenanceResult,
): RetentionCompletedEvent {
  return Object.freeze({ type: "operations.retention.completed", result });
}
