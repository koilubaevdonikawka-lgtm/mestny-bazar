import type { FeatureFlag } from "@server/application/feature-flag-management/models/feature-flag.model";

export interface IFeatureFlagRepository {
  save(flag: FeatureFlag): Promise<void>;
  findByKey(key: string): Promise<FeatureFlag | null>;
  delete(key: string): Promise<void>;
  findAll(): Promise<readonly FeatureFlag[]>;
}
