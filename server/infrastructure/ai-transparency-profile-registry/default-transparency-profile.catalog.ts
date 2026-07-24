import type { ITransparencyProfileCatalog } from "@server/application/ai-transparency-profile-registry/contracts/transparency-profile-catalog.contract";
import type { TransparencyProfile } from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";

/** Default in-memory transparency profile catalog index. */
export class DefaultTransparencyProfileCatalog implements ITransparencyProfileCatalog {
  private readonly transparencyProfiles = new Map<string, TransparencyProfile>();
  private readonly transparencyProfilesByName = new Map<string, string>();
  private readonly transparencyProfilesByCategory = new Map<string, Set<string>>();

  async register(transparencyProfile: TransparencyProfile): Promise<void> {
    const existing = this.transparencyProfiles.get(transparencyProfile.transparencyProfileId);
    if (existing) {
      if (existing.name !== transparencyProfile.name) {
        this.transparencyProfilesByName.delete(existing.name);
      }
      if (existing.category !== transparencyProfile.category) {
        this.removeFromCategory(existing.category, existing.transparencyProfileId);
      }
    }

    this.transparencyProfiles.set(transparencyProfile.transparencyProfileId, transparencyProfile);
    this.transparencyProfilesByName.set(transparencyProfile.name, transparencyProfile.transparencyProfileId);
    this.addToCategory(transparencyProfile.category, transparencyProfile.transparencyProfileId);
  }

  async remove(transparencyProfileId: string): Promise<void> {
    const transparencyProfile = this.transparencyProfiles.get(transparencyProfileId.trim());
    if (!transparencyProfile) {
      return;
    }
    this.transparencyProfiles.delete(transparencyProfile.transparencyProfileId);
    this.transparencyProfilesByName.delete(transparencyProfile.name);
    this.removeFromCategory(transparencyProfile.category, transparencyProfile.transparencyProfileId);
  }

  async findById(transparencyProfileId: string): Promise<TransparencyProfile | null> {
    return this.transparencyProfiles.get(transparencyProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<TransparencyProfile | null> {
    const transparencyProfileId = this.transparencyProfilesByName.get(name.trim());
    if (!transparencyProfileId) {
      return null;
    }
    return this.transparencyProfiles.get(transparencyProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly TransparencyProfile[]> {
    const transparencyProfileIds = this.transparencyProfilesByCategory.get(category.trim());
    if (!transparencyProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...transparencyProfileIds]
        .map((transparencyProfileId) => this.transparencyProfiles.get(transparencyProfileId))
        .filter((transparencyProfile): transparencyProfile is TransparencyProfile => transparencyProfile !== undefined),
    );
  }

  async listAll(): Promise<readonly TransparencyProfile[]> {
    return Object.freeze([...this.transparencyProfiles.values()]);
  }

  private addToCategory(category: string, transparencyProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.transparencyProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(transparencyProfileId);
    this.transparencyProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, transparencyProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.transparencyProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(transparencyProfileId);
    if (categorySet.size === 0) {
      this.transparencyProfilesByCategory.delete(normalizedCategory);
    }
  }
}
