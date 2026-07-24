import type { IAcceleratorProfileRepository } from "@server/application/ai-accelerator-profile-registry/contracts/accelerator-profile-repository.contract";
import type { AcceleratorProfile } from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";

/** In-memory accelerator profile store. */
export class AcceleratorProfileRepository implements IAcceleratorProfileRepository {
  private readonly acceleratorProfiles = new Map<string, AcceleratorProfile>();
  private readonly acceleratorProfilesByName = new Map<string, string>();
  private readonly acceleratorProfilesByCategory = new Map<string, Set<string>>();

  async save(acceleratorProfile: AcceleratorProfile): Promise<void> {
    const existing = this.acceleratorProfiles.get(acceleratorProfile.acceleratorProfileId);
    if (existing) {
      if (existing.name !== acceleratorProfile.name) {
        this.acceleratorProfilesByName.delete(existing.name);
      }
      if (existing.category !== acceleratorProfile.category) {
        this.removeFromCategory(existing.category, existing.acceleratorProfileId);
      }
    }

    this.acceleratorProfiles.set(acceleratorProfile.acceleratorProfileId, acceleratorProfile);
    this.acceleratorProfilesByName.set(acceleratorProfile.name, acceleratorProfile.acceleratorProfileId);
    this.addToCategory(acceleratorProfile.category, acceleratorProfile.acceleratorProfileId);
  }

  async findById(acceleratorProfileId: string): Promise<AcceleratorProfile | null> {
    return this.acceleratorProfiles.get(acceleratorProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<AcceleratorProfile | null> {
    const acceleratorProfileId = this.acceleratorProfilesByName.get(name.trim());
    if (!acceleratorProfileId) {
      return null;
    }
    return this.acceleratorProfiles.get(acceleratorProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly AcceleratorProfile[]> {
    const acceleratorProfileIds = this.acceleratorProfilesByCategory.get(category.trim());
    if (!acceleratorProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...acceleratorProfileIds]
        .map((acceleratorProfileId) => this.acceleratorProfiles.get(acceleratorProfileId))
        .filter((acceleratorProfile): acceleratorProfile is AcceleratorProfile => acceleratorProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly AcceleratorProfile[]> {
    return Object.freeze([...this.acceleratorProfiles.values()]);
  }

  async delete(acceleratorProfileId: string): Promise<boolean> {
    const acceleratorProfile = await this.findById(acceleratorProfileId);
    if (!acceleratorProfile) {
      return false;
    }
    this.acceleratorProfiles.delete(acceleratorProfile.acceleratorProfileId);
    this.acceleratorProfilesByName.delete(acceleratorProfile.name);
    this.removeFromCategory(acceleratorProfile.category, acceleratorProfile.acceleratorProfileId);
    return true;
  }

  private addToCategory(category: string, acceleratorProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.acceleratorProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(acceleratorProfileId);
    this.acceleratorProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, acceleratorProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.acceleratorProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(acceleratorProfileId);
    if (categorySet.size === 0) {
      this.acceleratorProfilesByCategory.delete(normalizedCategory);
    }
  }
}
