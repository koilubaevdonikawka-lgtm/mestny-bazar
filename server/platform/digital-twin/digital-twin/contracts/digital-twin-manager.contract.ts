import type {
  PlatformSnapshot,
  ProjectionResult,
  SimulationResult,
  SnapshotComparison,
  SnapshotKind,
} from "@server/platform/digital-twin/digital-twin/models";

/** Contract for digital twin orchestration. */
export interface IDigitalTwinManager {
  createSnapshot(kind: SnapshotKind): PlatformSnapshot;
  loadSnapshot(snapshotId: string): PlatformSnapshot | undefined;
  simulate(snapshotId: string, kind: SimulationResult["kind"]): SimulationResult;
  compareSnapshots(
    sourceSnapshotId: string,
    targetSnapshotId: string,
    kind?: SnapshotComparison["kind"],
  ): SnapshotComparison;
  synchronize(): readonly PlatformSnapshot[];
  generateProjection(
    snapshotId: string,
    kind: ProjectionResult["kind"],
  ): ProjectionResult;
}
