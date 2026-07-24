export {
  ArchitectureRegisteredEventName,
  type ArchitectureRegisteredEvent,
  createArchitectureRegisteredEvent,
} from "./architecture-registered.event";
export {
  DocumentationGeneratedEventName,
  type DocumentationGeneratedEvent,
  createDocumentationGeneratedEvent,
} from "./documentation-generated.event";
export {
  ValidationCompletedEventName,
  type ValidationCompletedEvent,
  createValidationCompletedEvent,
} from "./validation-completed.event";

export type DocumentationPlatformEvent =
  | ArchitectureRegisteredEvent
  | DocumentationGeneratedEvent
  | ValidationCompletedEvent;
