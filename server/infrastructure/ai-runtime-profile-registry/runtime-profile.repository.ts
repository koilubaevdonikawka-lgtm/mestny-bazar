import type { IRuntimeProfileRepository } from "@server/application/ai-runtime-profile-registry/contracts/runtime-profile-repository.contract";
import type { RuntimeProfile } from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";

/** In-memory runtime profile store. */
export class RuntimeProfileRepository implements IRuntimeProfileRepository {
  private readonly runtimeProfiles = new Map<string, RuntimeProfile>();
  private readonly runtimeProfilesByName = new Map<string, string>();
  private readonly runtimeProfilesByCategory = new Map<string, Set<string>>();

  async save(runtimeProfile: RuntimeProfile): Promise<void> {
    const existing = this.runtimeProfiles.get(runtimeProfile.runtimeProfileId);
    if (existing) {
      if (existing.name !== runtimeProfile.name) {
        this.runtimeProfilesByName.delete(existing.name);
      }
      if (existing.category !== runtimeProfile.category) {
        this.removeFromCategory(existing.category, existing.runtimeProfileId);
      }
    }

    this.runtimeProfiles.set(runtimeProfile.runtimeProfileId, runtimeProfile);
    this.runtimeProfilesByName.set(runtimeProfile.name, runtimeProfile.runtimeProfileId);
    this.addToCategory(runtimeProfile.category, runtimeProfile.runtimeProfileId);
  }

  async findById(runtimeProfileId: string): Promise<RuntimeProfile | null> {
    return this.runtimeProfiles.get(runtimeProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<RuntimeProfile | null> {
    const runtimeProfileId = this.runtimeProfilesByName.get(name.trim());
    if (!runtimeProfileId) {
      return null;
    }
    return this.runtimeProfiles.get(runtimeProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly RuntimeProfile[]> {
    const runtimeProfileIds = this.runtimeProfilesByCategory.get(category.trim());
    if (!runtimeProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...runtimeProfileIds]
        .map((runtimeProfileId) => this.runtimeProfiles.get(runtimeProfileId))
        .filter((runtimeProfile): runtimeProfile is RuntimeProfile => runtimeProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly RuntimeProfile[]> {
    return Object.freeze([...this.runtimeProfiles.values()]);
  }

  async delete(runtimeProfileId: string): Promise<boolean> {
    const runtimeProfile = await this.findById(runtimeProfileId);
    if (!runtimeProfile) {
      return false;
    }
    this.runtimeProfiles.delete(runtimeProfile.runtimeProfileId);
    this.runtimeProfilesByName.delete(runtimeProfile.name);
    this.removeFromCategory(runtimeProfile.category, runtimeProfile.runtimeProfileId);
    return true;
  }

  private addToCategory(category: string, runtimeProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.runtimeProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(runtimeProfileId);
    this.runtimeProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, runtimeProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.runtimeProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(runtimeProfileId);
    if (categorySet.size === 0) {
      this.runtimeProfilesByCategory.delete(normalizedCategory);
    }
  }
}
