import type {
  PlatformSnapshot,
  SnapshotKind,
} from "@server/platform/digital-twin/digital-twin/models";

/** Contract for platform snapshot capture (metadata only). */
export interface ISnapshotEngine {
  capture(kind: SnapshotKind): PlatformSnapshot;
  load(snapshotId: string): PlatformSnapshot | undefined;
  list(kind?: SnapshotKind): readonly PlatformSnapshot[];
}
