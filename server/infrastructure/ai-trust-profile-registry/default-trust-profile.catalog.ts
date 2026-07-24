import type { ITrustProfileCatalog } from "@server/application/ai-trust-profile-registry/contracts/trust-profile-catalog.contract";
import type { TrustProfile } from "@server/application/ai-trust-profile-registry/models/trust-profile.model";

/** Default in-memory trust profile catalog index. */
export class DefaultTrustProfileCatalog implements ITrustProfileCatalog {
  private readonly trustProfiles = new Map<string, TrustProfile>();
  private readonly trustProfilesByName = new Map<string, string>();
  private readonly trustProfilesByCategory = new Map<string, Set<string>>();

  async register(trustProfile: TrustProfile): Promise<void> {
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

  async remove(trustProfileId: string): Promise<void> {
    const trustProfile = this.trustProfiles.get(trustProfileId.trim());
    if (!trustProfile) {
      return;
    }
    this.trustProfiles.delete(trustProfile.trustProfileId);
    this.trustProfilesByName.delete(trustProfile.name);
    this.removeFromCategory(trustProfile.category, trustProfile.trustProfileId);
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

  async listAll(): Promise<readonly TrustProfile[]> {
    return Object.freeze([...this.trustProfiles.values()]);
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
