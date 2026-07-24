import type { FeatureFlag } from "@server/application/modules/administration/administration/models";

export interface FeatureFlagUpdatedEvent {
  readonly type: "administration.feature_flag.updated";
  readonly flag: FeatureFlag;
  readonly occurredAt: string;
}

export function createFeatureFlagUpdatedEvent(flag: FeatureFlag): FeatureFlagUpdatedEvent {
  return Object.freeze({
    type: "administration.feature_flag.updated",
    flag,
    occurredAt: new Date().toISOString(),
  });
}
