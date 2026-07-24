export {
  type SnapshotCreatedEvent,
  createSnapshotCreatedEvent,
} from "./snapshot-created.event";
export {
  type SimulationExecutedEvent,
  createSimulationExecutedEvent,
} from "./simulation-executed.event";
export {
  type SynchronizationCompletedEvent,
  createSynchronizationCompletedEvent,
} from "./synchronization-completed.event";
export {
  type ProjectionGeneratedEvent,
  createProjectionGeneratedEvent,
} from "./projection-generated.event";
export {
  type SnapshotComparedEvent,
  createSnapshotComparedEvent,
} from "./snapshot-compared.event";

export type DigitalTwinPlatformEvent =
  | SnapshotCreatedEvent
  | SimulationExecutedEvent
  | SynchronizationCompletedEvent
  | ProjectionGeneratedEvent
  | SnapshotComparedEvent;
