import type { ISafetyProfileCatalog } from "@server/application/ai-safety-profile-registry/contracts/safety-profile-catalog.contract";
import type { SafetyProfile } from "@server/application/ai-safety-profile-registry/models/safety-profile.model";

/** Default in-memory safety profile catalog index. */
export class DefaultSafetyProfileCatalog implements ISafetyProfileCatalog {
  private readonly safetyProfiles = new Map<string, SafetyProfile>();
  private readonly safetyProfilesByName = new Map<string, string>();
  private readonly safetyProfilesByCategory = new Map<string, Set<string>>();

  async register(safetyProfile: SafetyProfile): Promise<void> {
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

  async remove(safetyProfileId: string): Promise<void> {
    const safetyProfile = this.safetyProfiles.get(safetyProfileId.trim());
    if (!safetyProfile) {
      return;
    }
    this.safetyProfiles.delete(safetyProfile.safetyProfileId);
    this.safetyProfilesByName.delete(safetyProfile.name);
    this.removeFromCategory(safetyProfile.category, safetyProfile.safetyProfileId);
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

  async listAll(): Promise<readonly SafetyProfile[]> {
    return Object.freeze([...this.safetyProfiles.values()]);
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
