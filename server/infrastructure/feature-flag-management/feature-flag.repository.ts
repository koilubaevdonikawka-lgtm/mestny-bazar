import type { IFeatureFlagRepository } from "@server/application/feature-flag-management/contracts/feature-flag-repository.contract";
import type { FeatureFlag } from "@server/application/feature-flag-management/models/feature-flag.model";

/** In-memory feature flag store. */
export class FeatureFlagRepository implements IFeatureFlagRepository {
  private readonly flags = new Map<string, FeatureFlag>();

  async save(flag: FeatureFlag): Promise<void> {
    this.flags.set(flag.key, flag);
  }

  async findByKey(key: string): Promise<FeatureFlag | null> {
    return this.flags.get(key.trim()) ?? null;
  }

  async delete(key: string): Promise<void> {
    this.flags.delete(key.trim());
  }

  async findAll(): Promise<readonly FeatureFlag[]> {
    return Object.freeze([...this.flags.values()]);
  }
}
