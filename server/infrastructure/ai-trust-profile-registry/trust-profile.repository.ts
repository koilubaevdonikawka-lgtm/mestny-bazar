import type { ITrustProfileRepository } from "@server/application/ai-trust-profile-registry/contracts/trust-profile-repository.contract";
import type { TrustProfile } from "@server/application/ai-trust-profile-registry/models/trust-profile.model";

/** In-memory trust profile store. */
export class TrustProfileRepository implements ITrustProfileRepository {
  private readonly trustProfiles = new Map<string, TrustProfile>();
  private readonly trustProfilesByName = new Map<string, string>();
  private readonly trustProfilesByCategory = new Map<string, Set<string>>();

  async save(trustProfile: TrustProfile): Promise<void> {
    const existing = this.trustProfiles.get(trustProfile.trustProfileId);
    if (existing) {
      if (existing.name !== trustProfile.name) {
        this.trustProfilesByName.delete(existing.name);
      }
      if (existing.category !== trustProfile.category) {
        this.removeFromCategory(existing.category, existing.trustProfileId);
      }
    }

    this.trustProfiles.set(trustProfile.trustProfileId, trustProfile);
    this.trustProfilesByName.set(trustProfile.name, trustProfile.trustProfileId);
    this.addToCategory(trustProfile.category, trustProfile.trustProfileId);
  }

  async findById(trustProfileId: string): Promise<TrustProfile | null> {
    return this.trustProfiles.get(trustProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<TrustProfile | null> {
    const trustProfileId = this.trustProfilesByName.get(name.trim());
    if (!trustProfileId) {
      return null;
    }
    return this.trustProfiles.get(trustProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly TrustProfile[]> {
    const trustProfileIds = this.trustProfilesByCategory.get(category.trim());
    if (!trustProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...trustProfileIds]
        .map((trustProfileId) => this.trustProfiles.get(trustProfileId))
        .filter((trustProfile): trustProfile is TrustProfile => trustProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly TrustProfile[]> {
    return Object.freeze([...this.trustProfiles.values()]);
  }

  async delete(trustProfileId: string): Promise<boolean> {
    const trustProfile = await this.findById(trustProfileId);
    if (!trustProfile) {
      return false;
    }
    this.trustProfiles.delete(trustProfile.trustProfileId);
    this.trustProfilesByName.delete(trustProfile.name);
    this.removeFromCategory(trustProfile.category, trustProfile.trustProfileId);
    return true;
  }

  private addToCategory(category: string, trustProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.trustProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(trustProfileId);
    this.trustProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, trustProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.trustProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(trustProfileId);
    if (categorySet.size === 0) {
      this.trustProfilesByCategory.delete(normalizedCategory);
    }
  }
}
