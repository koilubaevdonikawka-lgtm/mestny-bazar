import type {
  ComparisonKind,
  SnapshotComparison,
} from "@server/platform/digital-twin/digital-twin/models";

/** Contract for snapshot comparison and diff. */
export interface ISnapshotComparisonEngine {
  compare(
    sourceSnapshotId: string,
    targetSnapshotId: string,
    kind?: ComparisonKind,
  ): SnapshotComparison;
}
