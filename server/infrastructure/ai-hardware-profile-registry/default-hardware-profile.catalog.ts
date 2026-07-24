import type { IHardwareProfileCatalog } from "@server/application/ai-hardware-profile-registry/contracts/hardware-profile-catalog.contract";
import type { HardwareProfile } from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";

/** Default in-memory hardware profile catalog index. */
export class DefaultHardwareProfileCatalog implements IHardwareProfileCatalog {
  private readonly hardwareProfiles = new Map<string, HardwareProfile>();
  private readonly hardwareProfilesByName = new Map<string, string>();
  private readonly hardwareProfilesByCategory = new Map<string, Set<string>>();

  async register(hardwareProfile: HardwareProfile): Promise<void> {
    const existing = this.hardwareProfiles.get(hardwareProfile.hardwareProfileId);
    if (existing) {
      if (existing.name !== hardwareProfile.name) {
        this.hardwareProfilesByName.delete(existing.name);
      }
      if (existing.category !== hardwareProfile.category) {
        this.removeFromCategory(existing.category, existing.hardwareProfileId);
      }
    }

    this.hardwareProfiles.set(hardwareProfile.hardwareProfileId, hardwareProfile);
    this.hardwareProfilesByName.set(hardwareProfile.name, hardwareProfile.hardwareProfileId);
    this.addToCategory(hardwareProfile.category, hardwareProfile.hardwareProfileId);
  }

  async remove(hardwareProfileId: string): Promise<void> {
    const hardwareProfile = this.hardwareProfiles.get(hardwareProfileId.trim());
    if (!hardwareProfile) {
      return;
    }
    this.hardwareProfiles.delete(hardwareProfile.hardwareProfileId);
    this.hardwareProfilesByName.delete(hardwareProfile.name);
    this.removeFromCategory(hardwareProfile.category, hardwareProfile.hardwareProfileId);
  }

  async findById(hardwareProfileId: string): Promise<HardwareProfile | null> {
    return this.hardwareProfiles.get(hardwareProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<HardwareProfile | null> {
    const hardwareProfileId = this.hardwareProfilesByName.get(name.trim());
    if (!hardwareProfileId) {
      return null;
    }
    return this.hardwareProfiles.get(hardwareProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly HardwareProfile[]> {
    const hardwareProfileIds = this.hardwareProfilesByCategory.get(category.trim());
    if (!hardwareProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...hardwareProfileIds]
        .map((hardwareProfileId) => this.hardwareProfiles.get(hardwareProfileId))
        .filter((hardwareProfile): hardwareProfile is HardwareProfile => hardwareProfile !== undefined),
    );
  }

  async listAll(): Promise<readonly HardwareProfile[]> {
    return Object.freeze([...this.hardwareProfiles.values()]);
  }

  private addToCategory(category: string, hardwareProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.hardwareProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(hardwareProfileId);
    this.hardwareProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, hardwareProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.hardwareProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(hardwareProfileId);
    if (categorySet.size === 0) {
      this.hardwareProfilesByCategory.delete(normalizedCategory);
    }
  }
}
