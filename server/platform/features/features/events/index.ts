export {
  type FeatureRegisteredEvent,
  createFeatureRegisteredEvent,
} from "./feature-registered.event";
export {
  type FeatureEnabledEvent,
  createFeatureEnabledEvent,
} from "./feature-enabled.event";
export {
  type FeatureDisabledEvent,
  createFeatureDisabledEvent,
} from "./feature-disabled.event";
export {
  type FeatureEvaluatedEvent,
  createFeatureEvaluatedEvent,
} from "./feature-evaluated.event";
export {
  type RolloutPlannedEvent,
  createRolloutPlannedEvent,
} from "./rollout-planned.event";

export type FeaturePlatformEvent =
  | FeatureRegisteredEvent
  | FeatureEnabledEvent
  | FeatureDisabledEvent
  | FeatureEvaluatedEvent
  | RolloutPlannedEvent;
