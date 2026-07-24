import type { IFeatureManager } from "@server/platform/features/features/contracts";
import type { IRolloutManager } from "@server/platform/features/features/contracts";
import type {
  FeatureDescriptor,
  FeatureEvaluation,
  RolloutPlan,
} from "@server/platform/features/features/models";

/** Public feature platform facade. */
export class FeaturePlatform {
  constructor(
    private readonly manager: IFeatureManager,
    private readonly rolloutManager: IRolloutManager,
  ) {}

  registerFeature(feature: FeatureDescriptor): FeatureDescriptor {
    return this.manager.registerFeature(feature);
  }

  enableFeature(featureId: string): FeatureDescriptor {
    return this.manager.enableFeature(featureId);
  }

  disableFeature(featureId: string): FeatureDescriptor {
    return this.manager.disableFeature(featureId);
  }

  evaluateFeature(featureId: string): FeatureEvaluation {
    return this.manager.evaluateFeature(featureId);
  }

  listFeatures(category?: FeatureDescriptor["category"]): readonly FeatureDescriptor[] {
    return this.manager.listFeatures(category);
  }

  planRollout(plan: RolloutPlan): RolloutPlan {
    return this.rolloutManager.planRollout(plan);
  }
}
