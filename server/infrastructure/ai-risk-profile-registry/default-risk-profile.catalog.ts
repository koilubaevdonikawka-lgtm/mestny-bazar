import type { IRiskProfileCatalog } from "@server/application/ai-risk-profile-registry/contracts/risk-profile-catalog.contract";
import type { RiskProfile } from "@server/application/ai-risk-profile-registry/models/risk-profile.model";

/** Default in-memory risk profile catalog index. */
export class DefaultRiskProfileCatalog implements IRiskProfileCatalog {
  private readonly riskProfiles = new Map<string, RiskProfile>();
  private readonly riskProfilesByName = new Map<string, string>();
  private readonly riskProfilesByCategory = new Map<string, Set<string>>();

  async register(riskProfile: RiskProfile): Promise<void> {
    const existing = this.riskProfiles.get(riskProfile.riskProfileId);
    if (existing) {
      if (existing.name !== riskProfile.name) {
        this.riskProfilesByName.delete(existing.name);
      }
      if (existing.category !== riskProfile.category) {
        this.removeFromCategory(existing.category, existing.riskProfileId);
      }
    }

    this.riskProfiles.set(riskProfile.riskProfileId, riskProfile);
    this.riskProfilesByName.set(riskProfile.name, riskProfile.riskProfileId);
    this.addToCategory(riskProfile.category, riskProfile.riskProfileId);
  }

  async remove(riskProfileId: string): Promise<void> {
    const riskProfile = this.riskProfiles.get(riskProfileId.trim());
    if (!riskProfile) {
      return;
    }
    this.riskProfiles.delete(riskProfile.riskProfileId);
    this.riskProfilesByName.delete(riskProfile.name);
    this.removeFromCategory(riskProfile.category, riskProfile.riskProfileId);
  }

  async findById(riskProfileId: string): Promise<RiskProfile | null> {
    return this.riskProfiles.get(riskProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<RiskProfile | null> {
    const riskProfileId = this.riskProfilesByName.get(name.trim());
    if (!riskProfileId) {
      return null;
    }
    return this.riskProfiles.get(riskProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly RiskProfile[]> {
    const riskProfileIds = this.riskProfilesByCategory.get(category.trim());
    if (!riskProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...riskProfileIds]
        .map((riskProfileId) => this.riskProfiles.get(riskProfileId))
        .filter((riskProfile): riskProfile is RiskProfile => riskProfile !== undefined),
    );
  }

  async listAll(): Promise<readonly RiskProfile[]> {
    return Object.freeze([...this.riskProfiles.values()]);
  }

  private addToCategory(category: string, riskProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.riskProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(riskProfileId);
    this.riskProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, riskProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.riskProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(riskProfileId);
    if (categorySet.size === 0) {
      this.riskProfilesByCategory.delete(normalizedCategory);
    }
  }
}
