import type { FeatureDescriptor } from "@server/platform/features/features/models";

export interface FeatureRegisteredEvent {
  readonly type: "features.feature.registered";
  readonly feature: FeatureDescriptor;
}

export function createFeatureRegisteredEvent(feature: FeatureDescriptor): FeatureRegisteredEvent {
  return Object.freeze({ type: "features.feature.registered", feature });
}
