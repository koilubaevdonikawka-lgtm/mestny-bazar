import type { FeatureEvaluation } from "@server/platform/features/features/models";

export interface FeatureEvaluatedEvent {
  readonly type: "features.feature.evaluated";
  readonly evaluation: FeatureEvaluation;
}

export function createFeatureEvaluatedEvent(evaluation: FeatureEvaluation): FeatureEvaluatedEvent {
  return Object.freeze({ type: "features.feature.evaluated", evaluation });
}
