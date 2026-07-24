import type { FeatureCategory, FeatureDescriptor } from "@server/platform/features/features/models";

/** Contract for feature metadata registration. */
export interface IFeatureRegistry {
  register(feature: FeatureDescriptor): FeatureDescriptor;
  get(featureId: string): FeatureDescriptor | undefined;
  update(feature: FeatureDescriptor): FeatureDescriptor;
  list(category?: FeatureCategory): readonly FeatureDescriptor[];
  listByCategory(category: FeatureCategory): readonly FeatureDescriptor[];
}
