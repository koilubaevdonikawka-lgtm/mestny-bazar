import type { IAccountabilityProfileCatalog } from "@server/application/ai-accountability-profile-registry/contracts/accountability-profile-catalog.contract";
import type { AccountabilityProfile } from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";

/** Default in-memory accountability profile catalog index. */
export class DefaultAccountabilityProfileCatalog implements IAccountabilityProfileCatalog {
  private readonly accountabilityProfiles = new Map<string, AccountabilityProfile>();
  private readonly accountabilityProfilesByName = new Map<string, string>();
  private readonly accountabilityProfilesByCategory = new Map<string, Set<string>>();

  async register(accountabilityProfile: AccountabilityProfile): Promise<void> {
    const existing = this.accountabilityProfiles.get(accountabilityProfile.accountabilityProfileId);
    if (existing) {
      if (existing.name !== accountabilityProfile.name) {
        this.accountabilityProfilesByName.delete(existing.name);
      }
      if (existing.category !== accountabilityProfile.category) {
        this.removeFromCategory(existing.category, existing.accountabilityProfileId);
      }
    }

    this.accountabilityProfiles.set(accountabilityProfile.accountabilityProfileId, accountabilityProfile);
    this.accountabilityProfilesByName.set(accountabilityProfile.name, accountabilityProfile.accountabilityProfileId);
    this.addToCategory(accountabilityProfile.category, accountabilityProfile.accountabilityProfileId);
  }

  async remove(accountabilityProfileId: string): Promise<void> {
    const accountabilityProfile = this.accountabilityProfiles.get(accountabilityProfileId.trim());
    if (!accountabilityProfile) {
      return;
    }
    this.accountabilityProfiles.delete(accountabilityProfile.accountabilityProfileId);
    this.accountabilityProfilesByName.delete(accountabilityProfile.name);
    this.removeFromCategory(accountabilityProfile.category, accountabilityProfile.accountabilityProfileId);
  }

  async findById(accountabilityProfileId: string): Promise<AccountabilityProfile | null> {
    return this.accountabilityProfiles.get(accountabilityProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<AccountabilityProfile | null> {
    const accountabilityProfileId = this.accountabilityProfilesByName.get(name.trim());
    if (!accountabilityProfileId) {
      return null;
    }
    return this.accountabilityProfiles.get(accountabilityProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly AccountabilityProfile[]> {
    const accountabilityProfileIds = this.accountabilityProfilesByCategory.get(category.trim());
    if (!accountabilityProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...accountabilityProfileIds]
        .map((accountabilityProfileId) => this.accountabilityProfiles.get(accountabilityProfileId))
        .filter((accountabilityProfile): accountabilityProfile is AccountabilityProfile => accountabilityProfile !== undefined),
    );
  }

  async listAll(): Promise<readonly AccountabilityProfile[]> {
    return Object.freeze([...this.accountabilityProfiles.values()]);
  }

  private addToCategory(category: string, accountabilityProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.accountabilityProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(accountabilityProfileId);
    this.accountabilityProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, accountabilityProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.accountabilityProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(accountabilityProfileId);
    if (categorySet.size === 0) {
      this.accountabilityProfilesByCategory.delete(normalizedCategory);
    }
  }
}
