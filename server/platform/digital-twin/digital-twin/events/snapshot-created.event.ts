import type { PlatformSnapshot } from "@server/platform/digital-twin/digital-twin/models";

export interface SnapshotCreatedEvent {
  readonly type: "digital-twin.snapshot.created";
  readonly snapshot: PlatformSnapshot;
}

export function createSnapshotCreatedEvent(snapshot: PlatformSnapshot): SnapshotCreatedEvent {
  return Object.freeze({ type: "digital-twin.snapshot.created", snapshot });
}
