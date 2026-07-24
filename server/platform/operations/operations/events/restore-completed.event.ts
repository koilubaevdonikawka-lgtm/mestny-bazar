import type { RestoreDescriptor } from "@server/platform/operations/operations/models";

/** Emitted when a restore completes. */
export interface RestoreCompletedEvent {
  readonly type: "operations.restore.completed";
  readonly restore: RestoreDescriptor;
}

export function createRestoreCompletedEvent(restore: RestoreDescriptor): RestoreCompletedEvent {
  return Object.freeze({ type: "operations.restore.completed", restore });
}
