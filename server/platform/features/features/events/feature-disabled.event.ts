import type { FeatureDescriptor } from "@server/platform/features/features/models";

export interface FeatureDisabledEvent {
  readonly type: "features.feature.disabled";
  readonly feature: FeatureDescriptor;
}

export function createFeatureDisabledEvent(feature: FeatureDescriptor): FeatureDisabledEvent {
  return Object.freeze({ type: "features.feature.disabled", feature });
}
