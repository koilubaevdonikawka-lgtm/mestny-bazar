import type { IServiceProfileRepository } from "@server/application/ai-service-profile-registry/contracts/service-profile-repository.contract";
import type { ServiceProfile } from "@server/application/ai-service-profile-registry/models/service-profile.model";

/** In-memory service profile store. */
export class ServiceProfileRepository implements IServiceProfileRepository {
  private readonly serviceProfiles = new Map<string, ServiceProfile>();
  private readonly serviceProfilesByName = new Map<string, string>();
  private readonly serviceProfilesByCategory = new Map<string, Set<string>>();

  async save(serviceProfile: ServiceProfile): Promise<void> {
    const existing = this.serviceProfiles.get(serviceProfile.serviceProfileId);
    if (existing) {
      if (existing.name !== serviceProfile.name) {
        this.serviceProfilesByName.delete(existing.name);
      }
      if (existing.category !== serviceProfile.category) {
        this.removeFromCategory(existing.category, existing.serviceProfileId);
      }
    }

    this.serviceProfiles.set(serviceProfile.serviceProfileId, serviceProfile);
    this.serviceProfilesByName.set(serviceProfile.name, serviceProfile.serviceProfileId);
    this.addToCategory(serviceProfile.category, serviceProfile.serviceProfileId);
  }

  async findById(serviceProfileId: string): Promise<ServiceProfile | null> {
    return this.serviceProfiles.get(serviceProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<ServiceProfile | null> {
    const serviceProfileId = this.serviceProfilesByName.get(name.trim());
    if (!serviceProfileId) {
      return null;
    }
    return this.serviceProfiles.get(serviceProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly ServiceProfile[]> {
    const serviceProfileIds = this.serviceProfilesByCategory.get(category.trim());
    if (!serviceProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...serviceProfileIds]
        .map((serviceProfileId) => this.serviceProfiles.get(serviceProfileId))
        .filter((serviceProfile): serviceProfile is ServiceProfile => serviceProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly ServiceProfile[]> {
    return Object.freeze([...this.serviceProfiles.values()]);
  }

  async delete(serviceProfileId: string): Promise<boolean> {
    const serviceProfile = await this.findById(serviceProfileId);
    if (!serviceProfile) {
      return false;
    }
    this.serviceProfiles.delete(serviceProfile.serviceProfileId);
    this.serviceProfilesByName.delete(serviceProfile.name);
    this.removeFromCategory(serviceProfile.category, serviceProfile.serviceProfileId);
    return true;
  }

  private addToCategory(category: string, serviceProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.serviceProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(serviceProfileId);
    this.serviceProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, serviceProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.serviceProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(serviceProfileId);
    if (categorySet.size === 0) {
      this.serviceProfilesByCategory.delete(normalizedCategory);
    }
  }
}
