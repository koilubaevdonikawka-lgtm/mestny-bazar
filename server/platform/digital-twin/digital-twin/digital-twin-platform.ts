import type { IDigitalTwinManager } from "@server/platform/digital-twin/digital-twin/contracts";
import type {
  PlatformSnapshot,
  ProjectionResult,
  SimulationResult,
  SnapshotComparison,
  SnapshotKind,
} from "@server/platform/digital-twin/digital-twin/models";

/** Public digital twin platform facade. */
export class DigitalTwinPlatform {
  constructor(private readonly manager: IDigitalTwinManager) {}

  createSnapshot(kind: SnapshotKind): PlatformSnapshot {
    return this.manager.createSnapshot(kind);
  }

  loadSnapshot(snapshotId: string): PlatformSnapshot | undefined {
    return this.manager.loadSnapshot(snapshotId);
  }

  simulate(snapshotId: string, kind: SimulationResult["kind"]): SimulationResult {
    return this.manager.simulate(snapshotId, kind);
  }

  compareSnapshots(
    sourceSnapshotId: string,
    targetSnapshotId: string,
    kind?: SnapshotComparison["kind"],
  ): SnapshotComparison {
    return this.manager.compareSnapshots(sourceSnapshotId, targetSnapshotId, kind);
  }

  synchronize(): readonly PlatformSnapshot[] {
    return this.manager.synchronize();
  }

  generateProjection(
    snapshotId: string,
    kind: ProjectionResult["kind"],
  ): ProjectionResult {
    return this.manager.generateProjection(snapshotId, kind);
  }
}
