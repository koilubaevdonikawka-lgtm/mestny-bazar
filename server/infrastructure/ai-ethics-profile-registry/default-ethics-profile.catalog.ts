import type { IEthicsProfileCatalog } from "@server/application/ai-ethics-profile-registry/contracts/ethics-profile-catalog.contract";
import type { EthicsProfile } from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";

/** Default in-memory ethics profile catalog index. */
export class DefaultEthicsProfileCatalog implements IEthicsProfileCatalog {
  private readonly ethicsProfiles = new Map<string, EthicsProfile>();
  private readonly ethicsProfilesByName = new Map<string, string>();
  private readonly ethicsProfilesByCategory = new Map<string, Set<string>>();

  async register(ethicsProfile: EthicsProfile): Promise<void> {
    const existing = this.ethicsProfiles.get(ethicsProfile.ethicsProfileId);
    if (existing) {
      if (existing.name !== ethicsProfile.name) {
        this.ethicsProfilesByName.delete(existing.name);
      }
      if (existing.category !== ethicsProfile.category) {
        this.removeFromCategory(existing.category, existing.ethicsProfileId);
      }
    }

    this.ethicsProfiles.set(ethicsProfile.ethicsProfileId, ethicsProfile);
    this.ethicsProfilesByName.set(ethicsProfile.name, ethicsProfile.ethicsProfileId);
    this.addToCategory(ethicsProfile.category, ethicsProfile.ethicsProfileId);
  }

  async remove(ethicsProfileId: string): Promise<void> {
    const ethicsProfile = this.ethicsProfiles.get(ethicsProfileId.trim());
    if (!ethicsProfile) {
      return;
    }
    this.ethicsProfiles.delete(ethicsProfile.ethicsProfileId);
    this.ethicsProfilesByName.delete(ethicsProfile.name);
    this.removeFromCategory(ethicsProfile.category, ethicsProfile.ethicsProfileId);
  }

  async findById(ethicsProfileId: string): Promise<EthicsProfile | null> {
    return this.ethicsProfiles.get(ethicsProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<EthicsProfile | null> {
    const ethicsProfileId = this.ethicsProfilesByName.get(name.trim());
    if (!ethicsProfileId) {
      return null;
    }
    return this.ethicsProfiles.get(ethicsProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly EthicsProfile[]> {
    const ethicsProfileIds = this.ethicsProfilesByCategory.get(category.trim());
    if (!ethicsProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...ethicsProfileIds]
        .map((ethicsProfileId) => this.ethicsProfiles.get(ethicsProfileId))
        .filter((ethicsProfile): ethicsProfile is EthicsProfile => ethicsProfile !== undefined),
    );
  }

  async listAll(): Promise<readonly EthicsProfile[]> {
    return Object.freeze([...this.ethicsProfiles.values()]);
  }

  private addToCategory(category: string, ethicsProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.ethicsProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(ethicsProfileId);
    this.ethicsProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, ethicsProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.ethicsProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(ethicsProfileId);
    if (categorySet.size === 0) {
      this.ethicsProfilesByCategory.delete(normalizedCategory);
    }
  }
}
