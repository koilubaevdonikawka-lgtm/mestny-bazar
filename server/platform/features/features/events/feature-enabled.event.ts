import type { FeatureDescriptor } from "@server/platform/features/features/models";

export interface FeatureEnabledEvent {
  readonly type: "features.feature.enabled";
  readonly feature: FeatureDescriptor;
}

export function createFeatureEnabledEvent(feature: FeatureDescriptor): FeatureEnabledEvent {
  return Object.freeze({ type: "features.feature.enabled", feature });
}
