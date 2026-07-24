export {
  type AnalysisCompletedEvent,
  createAnalysisCompletedEvent,
} from "./analysis-completed.event";
export {
  type InspectionCompletedEvent,
  createInspectionCompletedEvent,
} from "./inspection-completed.event";
export {
  type GenerationCompletedEvent,
  createGenerationCompletedEvent,
} from "./generation-completed.event";
export {
  type ScaffoldCompletedEvent,
  createScaffoldCompletedEvent,
} from "./scaffold-completed.event";

export type DeveloperPlatformEvent =
  | AnalysisCompletedEvent
  | InspectionCompletedEvent
  | GenerationCompletedEvent
  | ScaffoldCompletedEvent;
