/** DI tokens for the digital twin platform. */
export const DigitalTwinTokens = {
  DigitalTwinPlatform: Symbol.for("digital-twin.platform"),
  DigitalTwinManager: Symbol.for("digital-twin.manager"),
  DigitalTwinRegistry: Symbol.for("digital-twin.registry"),
  SnapshotEngine: Symbol.for("digital-twin.snapshotEngine"),
  SimulationEngine: Symbol.for("digital-twin.simulationEngine"),
  SynchronizationEngine: Symbol.for("digital-twin.synchronizationEngine"),
  ProjectionEngine: Symbol.for("digital-twin.projectionEngine"),
  SnapshotComparisonEngine: Symbol.for("digital-twin.snapshotComparisonEngine"),
} as const;

export type DigitalTwinToken = (typeof DigitalTwinTokens)[keyof typeof DigitalTwinTokens];
