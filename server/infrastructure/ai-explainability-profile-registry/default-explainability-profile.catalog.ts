import type { IExplainabilityProfileCatalog } from "@server/application/ai-explainability-profile-registry/contracts/explainability-profile-catalog.contract";
import type { ExplainabilityProfile } from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";

/** Default in-memory explainability profile catalog index. */
export class DefaultExplainabilityProfileCatalog implements IExplainabilityProfileCatalog {
  private readonly explainabilityProfiles = new Map<string, ExplainabilityProfile>();
  private readonly explainabilityProfilesByName = new Map<string, string>();
  private readonly explainabilityProfilesByCategory = new Map<string, Set<string>>();

  async register(explainabilityProfile: ExplainabilityProfile): Promise<void> {
    const existing = this.explainabilityProfiles.get(explainabilityProfile.explainabilityProfileId);
    if (existing) {
      if (existing.name !== explainabilityProfile.name) {
        this.explainabilityProfilesByName.delete(existing.name);
      }
      if (existing.category !== explainabilityProfile.category) {
        this.removeFromCategory(existing.category, existing.explainabilityProfileId);
      }
    }

    this.explainabilityProfiles.set(explainabilityProfile.explainabilityProfileId, explainabilityProfile);
    this.explainabilityProfilesByName.set(explainabilityProfile.name, explainabilityProfile.explainabilityProfileId);
    this.addToCategory(explainabilityProfile.category, explainabilityProfile.explainabilityProfileId);
  }

  async remove(explainabilityProfileId: string): Promise<void> {
    const explainabilityProfile = this.explainabilityProfiles.get(explainabilityProfileId.trim());
    if (!explainabilityProfile) {
      return;
    }
    this.explainabilityProfiles.delete(explainabilityProfile.explainabilityProfileId);
    this.explainabilityProfilesByName.delete(explainabilityProfile.name);
    this.removeFromCategory(explainabilityProfile.category, explainabilityProfile.explainabilityProfileId);
  }

  async findById(explainabilityProfileId: string): Promise<ExplainabilityProfile | null> {
    return this.explainabilityProfiles.get(explainabilityProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<ExplainabilityProfile | null> {
    const explainabilityProfileId = this.explainabilityProfilesByName.get(name.trim());
    if (!explainabilityProfileId) {
      return null;
    }
    return this.explainabilityProfiles.get(explainabilityProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly ExplainabilityProfile[]> {
    const explainabilityProfileIds = this.explainabilityProfilesByCategory.get(category.trim());
    if (!explainabilityProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...explainabilityProfileIds]
        .map((explainabilityProfileId) => this.explainabilityProfiles.get(explainabilityProfileId))
        .filter((explainabilityProfile): explainabilityProfile is ExplainabilityProfile => explainabilityProfile !== undefined),
    );
  }

  async listAll(): Promise<readonly ExplainabilityProfile[]> {
    return Object.freeze([...this.explainabilityProfiles.values()]);
  }

  private addToCategory(category: string, explainabilityProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.explainabilityProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(explainabilityProfileId);
    this.explainabilityProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, explainabilityProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.explainabilityProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(explainabilityProfileId);
    if (categorySet.size === 0) {
      this.explainabilityProfilesByCategory.delete(normalizedCategory);
    }
  }
}
