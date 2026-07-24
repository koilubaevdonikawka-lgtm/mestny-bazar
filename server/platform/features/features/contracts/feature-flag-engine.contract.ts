import type { FeatureFlag } from "@server/platform/features/features/models";
import type { TargetingContext } from "@server/platform/features/features/models";

/** Contract for feature flag evaluation (metadata only). */
export interface IFeatureFlagEngine {
  registerFlag(flag: FeatureFlag): FeatureFlag;
  listFlags(featureId?: string): readonly FeatureFlag[];
  evaluateFlag(flag: FeatureFlag, context: TargetingContext): boolean;
}
