import type { ICapabilityProfileCatalog } from "@server/application/ai-capability-profile-registry/contracts/capability-profile-catalog.contract";
import type { CapabilityProfile } from "@server/application/ai-capability-profile-registry/models/capability-profile.model";

/** Default in-memory capability profile catalog index. */
export class DefaultCapabilityProfileCatalog implements ICapabilityProfileCatalog {
  private readonly capabilityProfiles = new Map<string, CapabilityProfile>();
  private readonly capabilityProfilesByName = new Map<string, string>();
  private readonly capabilityProfilesByCategory = new Map<string, Set<string>>();

  async register(capabilityProfile: CapabilityProfile): Promise<void> {
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

  async remove(capabilityProfileId: string): Promise<void> {
    const capabilityProfile = this.capabilityProfiles.get(capabilityProfileId.trim());
    if (!capabilityProfile) {
      return;
    }
    this.capabilityProfiles.delete(capabilityProfile.capabilityProfileId);
    this.capabilityProfilesByName.delete(capabilityProfile.name);
    this.removeFromCategory(capabilityProfile.category, capabilityProfile.capabilityProfileId);
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

  async listAll(): Promise<readonly CapabilityProfile[]> {
    return Object.freeze([...this.capabilityProfiles.values()]);
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
