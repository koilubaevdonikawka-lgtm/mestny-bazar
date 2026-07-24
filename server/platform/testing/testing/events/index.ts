export {
  ScenarioStartedEventName,
  type ScenarioStartedEvent,
  createScenarioStartedEvent,
} from "./scenario-started.event";
export {
  ScenarioFinishedEventName,
  type ScenarioFinishedEvent,
  createScenarioFinishedEvent,
} from "./scenario-finished.event";
export {
  ScenarioFailedEventName,
  type ScenarioFailedEvent,
  createScenarioFailedEvent,
} from "./scenario-failed.event";

export type TestingPlatformEvent =
  | ScenarioStartedEvent
  | ScenarioFinishedEvent
  | ScenarioFailedEvent;
