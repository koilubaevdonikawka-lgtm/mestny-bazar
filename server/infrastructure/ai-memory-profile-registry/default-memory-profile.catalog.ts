import type { IMemoryProfileCatalog } from "@server/application/ai-memory-profile-registry/contracts/memory-profile-catalog.contract";
import type { MemoryProfile } from "@server/application/ai-memory-profile-registry/models/memory-profile.model";

/** Default in-memory memory profile catalog index. */
export class DefaultMemoryProfileCatalog implements IMemoryProfileCatalog {
  private readonly memoryProfiles = new Map<string, MemoryProfile>();
  private readonly memoryProfilesByName = new Map<string, string>();
  private readonly memoryProfilesByCategory = new Map<string, Set<string>>();

  async register(memoryProfile: MemoryProfile): Promise<void> {
    const existing = this.memoryProfiles.get(memoryProfile.memoryProfileId);
    if (existing) {
      if (existing.name !== memoryProfile.name) {
        this.memoryProfilesByName.delete(existing.name);
      }
      if (existing.category !== memoryProfile.category) {
        this.removeFromCategory(existing.category, existing.memoryProfileId);
      }
    }

    this.memoryProfiles.set(memoryProfile.memoryProfileId, memoryProfile);
    this.memoryProfilesByName.set(memoryProfile.name, memoryProfile.memoryProfileId);
    this.addToCategory(memoryProfile.category, memoryProfile.memoryProfileId);
  }

  async remove(memoryProfileId: string): Promise<void> {
    const memoryProfile = this.memoryProfiles.get(memoryProfileId.trim());
    if (!memoryProfile) {
      return;
    }
    this.memoryProfiles.delete(memoryProfile.memoryProfileId);
    this.memoryProfilesByName.delete(memoryProfile.name);
    this.removeFromCategory(memoryProfile.category, memoryProfile.memoryProfileId);
  }

  async findById(memoryProfileId: string): Promise<MemoryProfile | null> {
    return this.memoryProfiles.get(memoryProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<MemoryProfile | null> {
    const memoryProfileId = this.memoryProfilesByName.get(name.trim());
    if (!memoryProfileId) {
      return null;
    }
    return this.memoryProfiles.get(memoryProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly MemoryProfile[]> {
    const memoryProfileIds = this.memoryProfilesByCategory.get(category.trim());
    if (!memoryProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...memoryProfileIds]
        .map((memoryProfileId) => this.memoryProfiles.get(memoryProfileId))
        .filter((memoryProfile): memoryProfile is MemoryProfile => memoryProfile !== undefined),
    );
  }

  async listAll(): Promise<readonly MemoryProfile[]> {
    return Object.freeze([...this.memoryProfiles.values()]);
  }

  private addToCategory(category: string, memoryProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.memoryProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(memoryProfileId);
    this.memoryProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, memoryProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.memoryProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(memoryProfileId);
    if (categorySet.size === 0) {
      this.memoryProfilesByCategory.delete(normalizedCategory);
    }
  }
}
