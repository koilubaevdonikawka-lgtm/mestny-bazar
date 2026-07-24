import type { SnapshotComparison } from "@server/platform/digital-twin/digital-twin/models";

export interface SnapshotComparedEvent {
  readonly type: "digital-twin.snapshot.compared";
  readonly comparison: SnapshotComparison;
}

export function createSnapshotComparedEvent(comparison: SnapshotComparison): SnapshotComparedEvent {
  return Object.freeze({ type: "digital-twin.snapshot.compared", comparison });
}
