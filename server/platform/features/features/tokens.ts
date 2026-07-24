/** DI tokens for the feature platform. */
export const FeatureTokens = {
  FeaturePlatform: Symbol.for("features.platform"),
  FeatureManager: Symbol.for("features.manager"),
  FeatureRegistry: Symbol.for("features.registry"),
  FeatureFlagEngine: Symbol.for("features.flagEngine"),
  TargetingEngine: Symbol.for("features.targetingEngine"),
  RolloutManager: Symbol.for("features.rolloutManager"),
  ExperimentRegistry: Symbol.for("features.experimentRegistry"),
} as const;

export type FeatureToken = (typeof FeatureTokens)[keyof typeof FeatureTokens];
