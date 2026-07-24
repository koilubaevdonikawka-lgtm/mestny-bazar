import type { IFeatureFlagProvider } from "@server/application/feature-flag-management/contracts/feature-flag-provider.contract";
import type { IFeatureFlagRepository } from "@server/application/feature-flag-management/contracts/feature-flag-repository.contract";
import type { FeatureFlag } from "@server/application/feature-flag-management/models/feature-flag.model";

/** Default feature flag provider — reads from in-memory repository. */
export class DefaultFeatureFlagProvider implements IFeatureFlagProvider {
  constructor(private readonly repository: IFeatureFlagRepository) {}

  async getFlag(key: string): Promise<FeatureFlag | null> {
    return this.repository.findByKey(key.trim());
  }

  async getAllFlags(): Promise<readonly FeatureFlag[]> {
    return this.repository.findAll();
  }
}
