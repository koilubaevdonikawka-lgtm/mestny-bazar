import type { MigrationRegisteredEvent } from "./migration-registered.event";
import type { EvolutionPlannedEvent } from "./evolution-planned.event";
import type { EvolutionValidatedEvent } from "./evolution-validated.event";
import type { EvolutionCompletedEvent } from "./evolution-completed.event";

export {
  type MigrationRegisteredEvent,
  createMigrationRegisteredEvent,
} from "./migration-registered.event";
export {
  type EvolutionPlannedEvent,
  createEvolutionPlannedEvent,
} from "./evolution-planned.event";
export {
  type EvolutionValidatedEvent,
  createEvolutionValidatedEvent,
} from "./evolution-validated.event";
export {
  type EvolutionCompletedEvent,
  createEvolutionCompletedEvent,
} from "./evolution-completed.event";

export type EvolutionPlatformEvent =
  | MigrationRegisteredEvent
  | EvolutionPlannedEvent
  | EvolutionValidatedEvent
  | EvolutionCompletedEvent;
