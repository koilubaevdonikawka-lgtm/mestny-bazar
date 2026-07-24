import type { IPrivacyProfileCatalog } from "@server/application/ai-privacy-profile-registry/contracts/privacy-profile-catalog.contract";
import type { PrivacyProfile } from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";

/** Default in-memory privacy profile catalog index. */
export class DefaultPrivacyProfileCatalog implements IPrivacyProfileCatalog {
  private readonly privacyProfiles = new Map<string, PrivacyProfile>();
  private readonly privacyProfilesByName = new Map<string, string>();
  private readonly privacyProfilesByCategory = new Map<string, Set<string>>();

  async register(privacyProfile: PrivacyProfile): Promise<void> {
    const existing = this.privacyProfiles.get(privacyProfile.privacyProfileId);
    if (existing) {
      if (existing.name !== privacyProfile.name) {
        this.privacyProfilesByName.delete(existing.name);
      }
      if (existing.category !== privacyProfile.category) {
        this.removeFromCategory(existing.category, existing.privacyProfileId);
      }
    }

    this.privacyProfiles.set(privacyProfile.privacyProfileId, privacyProfile);
    this.privacyProfilesByName.set(privacyProfile.name, privacyProfile.privacyProfileId);
    this.addToCategory(privacyProfile.category, privacyProfile.privacyProfileId);
  }

  async remove(privacyProfileId: string): Promise<void> {
    const privacyProfile = this.privacyProfiles.get(privacyProfileId.trim());
    if (!privacyProfile) {
      return;
    }
    this.privacyProfiles.delete(privacyProfile.privacyProfileId);
    this.privacyProfilesByName.delete(privacyProfile.name);
    this.removeFromCategory(privacyProfile.category, privacyProfile.privacyProfileId);
  }

  async findById(privacyProfileId: string): Promise<PrivacyProfile | null> {
    return this.privacyProfiles.get(privacyProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<PrivacyProfile | null> {
    const privacyProfileId = this.privacyProfilesByName.get(name.trim());
    if (!privacyProfileId) {
      return null;
    }
    return this.privacyProfiles.get(privacyProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly PrivacyProfile[]> {
    const privacyProfileIds = this.privacyProfilesByCategory.get(category.trim());
    if (!privacyProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...privacyProfileIds]
        .map((privacyProfileId) => this.privacyProfiles.get(privacyProfileId))
        .filter((privacyProfile): privacyProfile is PrivacyProfile => privacyProfile !== undefined),
    );
  }

  async listAll(): Promise<readonly PrivacyProfile[]> {
    return Object.freeze([...this.privacyProfiles.values()]);
  }

  private addToCategory(category: string, privacyProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.privacyProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(privacyProfileId);
    this.privacyProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, privacyProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.privacyProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(privacyProfileId);
    if (categorySet.size === 0) {
      this.privacyProfilesByCategory.delete(normalizedCategory);
    }
  }
}
