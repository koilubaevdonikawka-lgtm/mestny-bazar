import type { PlatformSnapshot } from "@server/platform/digital-twin/digital-twin/models";

export interface SynchronizationCompletedEvent {
  readonly type: "digital-twin.synchronization.completed";
  readonly snapshots: readonly PlatformSnapshot[];
}

export function createSynchronizationCompletedEvent(
  snapshots: readonly PlatformSnapshot[],
): SynchronizationCompletedEvent {
  return Object.freeze({ type: "digital-twin.synchronization.completed", snapshots });
}
