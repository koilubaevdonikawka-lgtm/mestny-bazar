import type {
  SimulationKind,
  SimulationResult,
} from "@server/platform/digital-twin/digital-twin/models";

/** Contract for architecture simulation (metadata only, no side effects). */
export interface ISimulationEngine {
  simulate(snapshotId: string, kind: SimulationKind): SimulationResult;
}
