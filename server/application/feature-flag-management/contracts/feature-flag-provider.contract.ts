import type { FeatureFlag } from "@server/application/feature-flag-management/models/feature-flag.model";

export interface IFeatureFlagProvider {
  getFlag(key: string): Promise<FeatureFlag | null>;
  getAllFlags(): Promise<readonly FeatureFlag[]>;
}
