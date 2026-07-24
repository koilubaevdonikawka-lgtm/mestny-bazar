import type { IFairnessProfileCatalog } from "@server/application/ai-fairness-profile-registry/contracts/fairness-profile-catalog.contract";
import type { FairnessProfile } from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";

/** Default in-memory fairness profile catalog index. */
export class DefaultFairnessProfileCatalog implements IFairnessProfileCatalog {
  private readonly fairnessProfiles = new Map<string, FairnessProfile>();
  private readonly fairnessProfilesByName = new Map<string, string>();
  private readonly fairnessProfilesByCategory = new Map<string, Set<string>>();

  async register(fairnessProfile: FairnessProfile): Promise<void> {
    const existing = this.fairnessProfiles.get(fairnessProfile.fairnessProfileId);
    if (existing) {
      if (existing.name !== fairnessProfile.name) {
        this.fairnessProfilesByName.delete(existing.name);
      }
      if (existing.category !== fairnessProfile.category) {
        this.removeFromCategory(existing.category, existing.fairnessProfileId);
      }
    }

    this.fairnessProfiles.set(fairnessProfile.fairnessProfileId, fairnessProfile);
    this.fairnessProfilesByName.set(fairnessProfile.name, fairnessProfile.fairnessProfileId);
    this.addToCategory(fairnessProfile.category, fairnessProfile.fairnessProfileId);
  }

  async remove(fairnessProfileId: string): Promise<void> {
    const fairnessProfile = this.fairnessProfiles.get(fairnessProfileId.trim());
    if (!fairnessProfile) {
      return;
    }
    this.fairnessProfiles.delete(fairnessProfile.fairnessProfileId);
    this.fairnessProfilesByName.delete(fairnessProfile.name);
    this.removeFromCategory(fairnessProfile.category, fairnessProfile.fairnessProfileId);
  }

  async findById(fairnessProfileId: string): Promise<FairnessProfile | null> {
    return this.fairnessProfiles.get(fairnessProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<FairnessProfile | null> {
    const fairnessProfileId = this.fairnessProfilesByName.get(name.trim());
    if (!fairnessProfileId) {
      return null;
    }
    return this.fairnessProfiles.get(fairnessProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly FairnessProfile[]> {
    const fairnessProfileIds = this.fairnessProfilesByCategory.get(category.trim());
    if (!fairnessProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...fairnessProfileIds]
        .map((fairnessProfileId) => this.fairnessProfiles.get(fairnessProfileId))
        .filter((fairnessProfile): fairnessProfile is FairnessProfile => fairnessProfile !== undefined),
    );
  }

  async listAll(): Promise<readonly FairnessProfile[]> {
    return Object.freeze([...this.fairnessProfiles.values()]);
  }

  private addToCategory(category: string, fairnessProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.fairnessProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(fairnessProfileId);
    this.fairnessProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, fairnessProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.fairnessProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(fairnessProfileId);
    if (categorySet.size === 0) {
      this.fairnessProfilesByCategory.delete(normalizedCategory);
    }
  }
}
