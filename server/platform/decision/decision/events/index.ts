export {
  type DecisionEvaluatedEvent,
  createDecisionEvaluatedEvent,
} from "./decision-evaluated.event";
export { type DecisionMadeEvent, createDecisionMadeEvent } from "./decision-made.event";
export {
  type DecisionExplainedEvent,
  createDecisionExplainedEvent,
} from "./decision-explained.event";
export {
  type DecisionReplayedEvent,
  createDecisionReplayedEvent,
} from "./decision-replayed.event";
export {
  type ConfidenceCalculatedEvent,
  createConfidenceCalculatedEvent,
} from "./confidence-calculated.event";

export type DecisionPlatformEvent =
  | DecisionEvaluatedEvent
  | DecisionMadeEvent
  | DecisionExplainedEvent
  | DecisionReplayedEvent
  | ConfidenceCalculatedEvent;
