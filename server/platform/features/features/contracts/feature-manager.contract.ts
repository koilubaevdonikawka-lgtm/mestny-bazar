import type {
  FeatureDescriptor,
  FeatureEvaluation,
} from "@server/platform/features/features/models";

/** Contract for feature lifecycle orchestration. */
export interface IFeatureManager {
  registerFeature(feature: FeatureDescriptor): FeatureDescriptor;
  enableFeature(featureId: string): FeatureDescriptor;
  disableFeature(featureId: string): FeatureDescriptor;
  evaluateFeature(featureId: string): FeatureEvaluation;
  listFeatures(category?: FeatureDescriptor["category"]): readonly FeatureDescriptor[];
}
