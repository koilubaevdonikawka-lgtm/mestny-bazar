import type { FeatureFlag } from "@server/application/feature-flag-management/models/feature-flag.model";

export interface IFeatureFlagEvaluator {
  evaluate(flag: FeatureFlag): boolean;
}
