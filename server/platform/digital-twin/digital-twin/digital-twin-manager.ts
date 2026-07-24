import type { IDigitalTwinManager } from "@server/platform/digital-twin/digital-twin/contracts";
import type { ISnapshotEngine } from "@server/platform/digital-twin/digital-twin/contracts";
import type { ISimulationEngine } from "@server/platform/digital-twin/digital-twin/contracts";
import type { ISynchronizationEngine } from "@server/platform/digital-twin/digital-twin/contracts";
import type { IProjectionEngine } from "@server/platform/digital-twin/digital-twin/contracts";
import type { ISnapshotComparisonEngine } from "@server/platform/digital-twin/digital-twin/contracts";
import type {
  PlatformSnapshot,
  ProjectionResult,
  SimulationResult,
  SnapshotComparison,
  SnapshotKind,
} from "@server/platform/digital-twin/digital-twin/models";

/** Orchestrates digital twin snapshots, simulation and synchronization. */
export class DigitalTwinManager implements IDigitalTwinManager {
  constructor(
    private readonly snapshotEngine: ISnapshotEngine,
    private readonly simulationEngine: ISimulationEngine,
    private readonly synchronizationEngine: ISynchronizationEngine,
    private readonly projectionEngine: IProjectionEngine,
    private readonly comparisonEngine: ISnapshotComparisonEngine,
  ) {}

  createSnapshot(kind: SnapshotKind): PlatformSnapshot {
    return this.snapshotEngine.capture(kind);
  }

  loadSnapshot(snapshotId: string): PlatformSnapshot | undefined {
    return this.snapshotEngine.load(snapshotId);
  }

  simulate(snapshotId: string, kind: SimulationResult["kind"]): SimulationResult {
    return this.simulationEngine.simulate(snapshotId, kind);
  }

  compareSnapshots(
    sourceSnapshotId: string,
    targetSnapshotId: string,
    kind?: SnapshotComparison["kind"],
  ): SnapshotComparison {
    return this.comparisonEngine.compare(sourceSnapshotId, targetSnapshotId, kind);
  }

  synchronize(): readonly PlatformSnapshot[] {
    return this.synchronizationEngine.synchronize();
  }

  generateProjection(
    snapshotId: string,
    kind: ProjectionResult["kind"],
  ): ProjectionResult {
    return this.projectionEngine.generate(snapshotId, kind);
  }
}
