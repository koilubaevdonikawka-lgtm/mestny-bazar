import type { SimulationResult } from "@server/platform/digital-twin/digital-twin/models";

export interface SimulationExecutedEvent {
  readonly type: "digital-twin.simulation.executed";
  readonly result: SimulationResult;
}

export function createSimulationExecutedEvent(result: SimulationResult): SimulationExecutedEvent {
  return Object.freeze({ type: "digital-twin.simulation.executed", result });
}
