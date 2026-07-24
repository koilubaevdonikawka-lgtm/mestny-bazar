import type { IExplainabilityProfileRepository } from "@server/application/ai-explainability-profile-registry/contracts/explainability-profile-repository.contract";
import type { ExplainabilityProfile } from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";

/** In-memory explainability profile store. */
export class ExplainabilityProfileRepository implements IExplainabilityProfileRepository {
  private readonly explainabilityProfiles = new Map<string, ExplainabilityProfile>();
  private readonly explainabilityProfilesByName = new Map<string, string>();
  private readonly explainabilityProfilesByCategory = new Map<string, Set<string>>();

  async save(explainabilityProfile: ExplainabilityProfile): Promise<void> {
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

  async findAll(): Promise<readonly ExplainabilityProfile[]> {
    return Object.freeze([...this.explainabilityProfiles.values()]);
  }

  async delete(explainabilityProfileId: string): Promise<boolean> {
    const explainabilityProfile = await this.findById(explainabilityProfileId);
    if (!explainabilityProfile) {
      return false;
    }
    this.explainabilityProfiles.delete(explainabilityProfile.explainabilityProfileId);
    this.explainabilityProfilesByName.delete(explainabilityProfile.name);
    this.removeFromCategory(explainabilityProfile.category, explainabilityProfile.explainabilityProfileId);
    return true;
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
