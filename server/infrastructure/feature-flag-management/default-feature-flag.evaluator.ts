import type { IFeatureFlagEvaluator } from "@server/application/feature-flag-management/contracts/feature-flag-evaluator.contract";
import type { FeatureFlag } from "@server/application/feature-flag-management/models/feature-flag.model";

/** Default feature flag evaluator — returns stored enabled state. */
export class DefaultFeatureFlagEvaluator implements IFeatureFlagEvaluator {
  evaluate(flag: FeatureFlag): boolean {
    return flag.enabled;
  }
}
