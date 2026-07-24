import type { IResourceProfileRepository } from "@server/application/ai-resource-profile-registry/contracts/resource-profile-repository.contract";
import type { ResourceProfile } from "@server/application/ai-resource-profile-registry/models/resource-profile.model";

/** In-memory resource profile store. */
export class ResourceProfileRepository implements IResourceProfileRepository {
  private readonly resourceProfiles = new Map<string, ResourceProfile>();
  private readonly resourceProfilesByName = new Map<string, string>();
  private readonly resourceProfilesByCategory = new Map<string, Set<string>>();

  async save(resourceProfile: ResourceProfile): Promise<void> {
    const existing = this.resourceProfiles.get(resourceProfile.resourceProfileId);
    if (existing) {
      if (existing.name !== resourceProfile.name) {
        this.resourceProfilesByName.delete(existing.name);
      }
      if (existing.category !== resourceProfile.category) {
        this.removeFromCategory(existing.category, existing.resourceProfileId);
      }
    }

    this.resourceProfiles.set(resourceProfile.resourceProfileId, resourceProfile);
    this.resourceProfilesByName.set(resourceProfile.name, resourceProfile.resourceProfileId);
    this.addToCategory(resourceProfile.category, resourceProfile.resourceProfileId);
  }

  async findById(resourceProfileId: string): Promise<ResourceProfile | null> {
    return this.resourceProfiles.get(resourceProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<ResourceProfile | null> {
    const resourceProfileId = this.resourceProfilesByName.get(name.trim());
    if (!resourceProfileId) {
      return null;
    }
    return this.resourceProfiles.get(resourceProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly ResourceProfile[]> {
    const resourceProfileIds = this.resourceProfilesByCategory.get(category.trim());
    if (!resourceProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...resourceProfileIds]
        .map((resourceProfileId) => this.resourceProfiles.get(resourceProfileId))
        .filter((resourceProfile): resourceProfile is ResourceProfile => resourceProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly ResourceProfile[]> {
    return Object.freeze([...this.resourceProfiles.values()]);
  }

  async delete(resourceProfileId: string): Promise<boolean> {
    const resourceProfile = await this.findById(resourceProfileId);
    if (!resourceProfile) {
      return false;
    }
    this.resourceProfiles.delete(resourceProfile.resourceProfileId);
    this.resourceProfilesByName.delete(resourceProfile.name);
    this.removeFromCategory(resourceProfile.category, resourceProfile.resourceProfileId);
    return true;
  }

  private addToCategory(category: string, resourceProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.resourceProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(resourceProfileId);
    this.resourceProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, resourceProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.resourceProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(resourceProfileId);
    if (categorySet.size === 0) {
      this.resourceProfilesByCategory.delete(normalizedCategory);
    }
  }
}
