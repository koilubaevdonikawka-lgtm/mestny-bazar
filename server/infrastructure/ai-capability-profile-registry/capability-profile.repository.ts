import type { ICapabilityProfileRepository } from "@server/application/ai-capability-profile-registry/contracts/capability-profile-repository.contract";
import type { CapabilityProfile } from "@server/application/ai-capability-profile-registry/models/capability-profile.model";

/** In-memory capability profile store. */
export class CapabilityProfileRepository implements ICapabilityProfileRepository {
  private readonly capabilityProfiles = new Map<string, CapabilityProfile>();
  private readonly capabilityProfilesByName = new Map<string, string>();
  private readonly capabilityProfilesByCategory = new Map<string, Set<string>>();

  async save(capabilityProfile: CapabilityProfile): Promise<void> {
    const existing = this.capabilityProfiles.get(capabilityProfile.capabilityProfileId);
    if (existing) {
      if (existing.name !== capabilityProfile.name) {
        this.capabilityProfilesByName.delete(existing.name);
      }
      if (existing.category !== capabilityProfile.category) {
        this.removeFromCategory(existing.category, existing.capabilityProfileId);
      }
    }

    this.capabilityProfiles.set(capabilityProfile.capabilityProfileId, capabilityProfile);
    this.capabilityProfilesByName.set(capabilityProfile.name, capabilityProfile.capabilityProfileId);
    this.addToCategory(capabilityProfile.category, capabilityProfile.capabilityProfileId);
  }

  async findById(capabilityProfileId: string): Promise<CapabilityProfile | null> {
    return this.capabilityProfiles.get(capabilityProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<CapabilityProfile | null> {
    const capabilityProfileId = this.capabilityProfilesByName.get(name.trim());
    if (!capabilityProfileId) {
      return null;
    }
    return this.capabilityProfiles.get(capabilityProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly CapabilityProfile[]> {
    const capabilityProfileIds = this.capabilityProfilesByCategory.get(category.trim());
    if (!capabilityProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...capabilityProfileIds]
        .map((capabilityProfileId) => this.capabilityProfiles.get(capabilityProfileId))
        .filter((capabilityProfile): capabilityProfile is CapabilityProfile => capabilityProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly CapabilityProfile[]> {
    return Object.freeze([...this.capabilityProfiles.values()]);
  }

  async delete(capabilityProfileId: string): Promise<boolean> {
    const capabilityProfile = await this.findById(capabilityProfileId);
    if (!capabilityProfile) {
      return false;
    }
    this.capabilityProfiles.delete(capabilityProfile.capabilityProfileId);
    this.capabilityProfilesByName.delete(capabilityProfile.name);
    this.removeFromCategory(capabilityProfile.category, capabilityProfile.capabilityProfileId);
    return true;
  }

  private addToCategory(category: string, capabilityProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.capabilityProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(capabilityProfileId);
    this.capabilityProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, capabilityProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.capabilityProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(capabilityProfileId);
    if (categorySet.size === 0) {
      this.capabilityProfilesByCategory.delete(normalizedCategory);
    }
  }
}
