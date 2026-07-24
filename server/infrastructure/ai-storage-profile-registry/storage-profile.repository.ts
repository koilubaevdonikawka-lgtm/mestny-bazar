import type { IStorageProfileRepository } from "@server/application/ai-storage-profile-registry/contracts/storage-profile-repository.contract";
import type { StorageProfile } from "@server/application/ai-storage-profile-registry/models/storage-profile.model";

/** In-memory storage profile store. */
export class StorageProfileRepository implements IStorageProfileRepository {
  private readonly storageProfiles = new Map<string, StorageProfile>();
  private readonly storageProfilesByName = new Map<string, string>();
  private readonly storageProfilesByCategory = new Map<string, Set<string>>();

  async save(storageProfile: StorageProfile): Promise<void> {
    const existing = this.storageProfiles.get(storageProfile.storageProfileId);
    if (existing) {
      if (existing.name !== storageProfile.name) {
        this.storageProfilesByName.delete(existing.name);
      }
      if (existing.category !== storageProfile.category) {
        this.removeFromCategory(existing.category, existing.storageProfileId);
      }
    }

    this.storageProfiles.set(storageProfile.storageProfileId, storageProfile);
    this.storageProfilesByName.set(storageProfile.name, storageProfile.storageProfileId);
    this.addToCategory(storageProfile.category, storageProfile.storageProfileId);
  }

  async findById(storageProfileId: string): Promise<StorageProfile | null> {
    return this.storageProfiles.get(storageProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<StorageProfile | null> {
    const storageProfileId = this.storageProfilesByName.get(name.trim());
    if (!storageProfileId) {
      return null;
    }
    return this.storageProfiles.get(storageProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly StorageProfile[]> {
    const storageProfileIds = this.storageProfilesByCategory.get(category.trim());
    if (!storageProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...storageProfileIds]
        .map((storageProfileId) => this.storageProfiles.get(storageProfileId))
        .filter((storageProfile): storageProfile is StorageProfile => storageProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly StorageProfile[]> {
    return Object.freeze([...this.storageProfiles.values()]);
  }

  async delete(storageProfileId: string): Promise<boolean> {
    const storageProfile = await this.findById(storageProfileId);
    if (!storageProfile) {
      return false;
    }
    this.storageProfiles.delete(storageProfile.storageProfileId);
    this.storageProfilesByName.delete(storageProfile.name);
    this.removeFromCategory(storageProfile.category, storageProfile.storageProfileId);
    return true;
  }

  private addToCategory(category: string, storageProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.storageProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(storageProfileId);
    this.storageProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, storageProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.storageProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(storageProfileId);
    if (categorySet.size === 0) {
      this.storageProfilesByCategory.delete(normalizedCategory);
    }
  }
}
