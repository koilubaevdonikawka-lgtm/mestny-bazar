import type { ISafetyProfileRepository } from "@server/application/ai-safety-profile-registry/contracts/safety-profile-repository.contract";
import type { SafetyProfile } from "@server/application/ai-safety-profile-registry/models/safety-profile.model";

/** In-memory safety profile store. */
export class SafetyProfileRepository implements ISafetyProfileRepository {
  private readonly safetyProfiles = new Map<string, SafetyProfile>();
  private readonly safetyProfilesByName = new Map<string, string>();
  private readonly safetyProfilesByCategory = new Map<string, Set<string>>();

  async save(safetyProfile: SafetyProfile): Promise<void> {
    const existing = this.safetyProfiles.get(safetyProfile.safetyProfileId);
    if (existing) {
      if (existing.name !== safetyProfile.name) {
        this.safetyProfilesByName.delete(existing.name);
      }
      if (existing.category !== safetyProfile.category) {
        this.removeFromCategory(existing.category, existing.safetyProfileId);
      }
    }

    this.safetyProfiles.set(safetyProfile.safetyProfileId, safetyProfile);
    this.safetyProfilesByName.set(safetyProfile.name, safetyProfile.safetyProfileId);
    this.addToCategory(safetyProfile.category, safetyProfile.safetyProfileId);
  }

  async findById(safetyProfileId: string): Promise<SafetyProfile | null> {
    return this.safetyProfiles.get(safetyProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<SafetyProfile | null> {
    const safetyProfileId = this.safetyProfilesByName.get(name.trim());
    if (!safetyProfileId) {
      return null;
    }
    return this.safetyProfiles.get(safetyProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly SafetyProfile[]> {
    const safetyProfileIds = this.safetyProfilesByCategory.get(category.trim());
    if (!safetyProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...safetyProfileIds]
        .map((safetyProfileId) => this.safetyProfiles.get(safetyProfileId))
        .filter((safetyProfile): safetyProfile is SafetyProfile => safetyProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly SafetyProfile[]> {
    return Object.freeze([...this.safetyProfiles.values()]);
  }

  async delete(safetyProfileId: string): Promise<boolean> {
    const safetyProfile = await this.findById(safetyProfileId);
    if (!safetyProfile) {
      return false;
    }
    this.safetyProfiles.delete(safetyProfile.safetyProfileId);
    this.safetyProfilesByName.delete(safetyProfile.name);
    this.removeFromCategory(safetyProfile.category, safetyProfile.safetyProfileId);
    return true;
  }

  private addToCategory(category: string, safetyProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.safetyProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(safetyProfileId);
    this.safetyProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, safetyProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.safetyProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(safetyProfileId);
    if (categorySet.size === 0) {
      this.safetyProfilesByCategory.delete(normalizedCategory);
    }
  }
}
