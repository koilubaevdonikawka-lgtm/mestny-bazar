export {
  type GovernanceEvaluationCompletedEvent,
  createGovernanceEvaluationCompletedEvent,
} from "./governance-evaluation-completed.event";
export {
  type GovernancePlanGeneratedEvent,
  createGovernancePlanGeneratedEvent,
} from "./governance-plan-generated.event";
export {
  type PlatformCoordinatedEvent,
  createPlatformCoordinatedEvent,
} from "./platform-coordinated.event";
export {
  type GovernanceRecommendationGeneratedEvent,
  createGovernanceRecommendationGeneratedEvent,
} from "./recommendation-generated.event";
export {
  type GovernanceHealthCalculatedEvent,
  createGovernanceHealthCalculatedEvent,
} from "./governance-health-calculated.event";

export type AutonomousGovernancePlatformEvent =
  | GovernanceEvaluationCompletedEvent
  | GovernancePlanGeneratedEvent
  | PlatformCoordinatedEvent
  | GovernanceRecommendationGeneratedEvent
  | GovernanceHealthCalculatedEvent;
