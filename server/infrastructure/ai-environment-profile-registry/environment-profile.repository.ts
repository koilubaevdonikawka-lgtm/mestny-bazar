import type { IEnvironmentProfileRepository } from "@server/application/ai-environment-profile-registry/contracts/environment-profile-repository.contract";
import type { EnvironmentProfile } from "@server/application/ai-environment-profile-registry/models/environment-profile.model";

/** In-memory environment profile store. */
export class EnvironmentProfileRepository implements IEnvironmentProfileRepository {
  private readonly environmentProfiles = new Map<string, EnvironmentProfile>();
  private readonly environmentProfilesByName = new Map<string, string>();
  private readonly environmentProfilesByCategory = new Map<string, Set<string>>();

  async save(environmentProfile: EnvironmentProfile): Promise<void> {
    const existing = this.environmentProfiles.get(environmentProfile.environmentProfileId);
    if (existing) {
      if (existing.name !== environmentProfile.name) {
        this.environmentProfilesByName.delete(existing.name);
      }
      if (existing.category !== environmentProfile.category) {
        this.removeFromCategory(existing.category, existing.environmentProfileId);
      }
    }

    this.environmentProfiles.set(environmentProfile.environmentProfileId, environmentProfile);
    this.environmentProfilesByName.set(environmentProfile.name, environmentProfile.environmentProfileId);
    this.addToCategory(environmentProfile.category, environmentProfile.environmentProfileId);
  }

  async findById(environmentProfileId: string): Promise<EnvironmentProfile | null> {
    return this.environmentProfiles.get(environmentProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<EnvironmentProfile | null> {
    const environmentProfileId = this.environmentProfilesByName.get(name.trim());
    if (!environmentProfileId) {
      return null;
    }
    return this.environmentProfiles.get(environmentProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly EnvironmentProfile[]> {
    const environmentProfileIds = this.environmentProfilesByCategory.get(category.trim());
    if (!environmentProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...environmentProfileIds]
        .map((environmentProfileId) => this.environmentProfiles.get(environmentProfileId))
        .filter(
          (environmentProfile): environmentProfile is EnvironmentProfile =>
            environmentProfile !== undefined,
        ),
    );
  }

  async findAll(): Promise<readonly EnvironmentProfile[]> {
    return Object.freeze([...this.environmentProfiles.values()]);
  }

  async delete(environmentProfileId: string): Promise<boolean> {
    const environmentProfile = await this.findById(environmentProfileId);
    if (!environmentProfile) {
      return false;
    }
    this.environmentProfiles.delete(environmentProfile.environmentProfileId);
    this.environmentProfilesByName.delete(environmentProfile.name);
    this.removeFromCategory(environmentProfile.category, environmentProfile.environmentProfileId);
    return true;
  }

  private addToCategory(category: string, environmentProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet =
      this.environmentProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(environmentProfileId);
    this.environmentProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, environmentProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.environmentProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(environmentProfileId);
    if (categorySet.size === 0) {
      this.environmentProfilesByCategory.delete(normalizedCategory);
    }
  }
}
