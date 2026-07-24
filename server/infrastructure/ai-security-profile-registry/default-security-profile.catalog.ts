import type { ISecurityProfileCatalog } from "@server/application/ai-security-profile-registry/contracts/security-profile-catalog.contract";
import type { SecurityProfile } from "@server/application/ai-security-profile-registry/models/security-profile.model";

/** Default in-memory security profile catalog index. */
export class DefaultSecurityProfileCatalog implements ISecurityProfileCatalog {
  private readonly securityProfiles = new Map<string, SecurityProfile>();
  private readonly securityProfilesByName = new Map<string, string>();
  private readonly securityProfilesByCategory = new Map<string, Set<string>>();

  async register(securityProfile: SecurityProfile): Promise<void> {
    const existing = this.securityProfiles.get(securityProfile.securityProfileId);
    if (existing) {
      if (existing.name !== securityProfile.name) {
        this.securityProfilesByName.delete(existing.name);
      }
      if (existing.category !== securityProfile.category) {
        this.removeFromCategory(existing.category, existing.securityProfileId);
      }
    }

    this.securityProfiles.set(securityProfile.securityProfileId, securityProfile);
    this.securityProfilesByName.set(securityProfile.name, securityProfile.securityProfileId);
    this.addToCategory(securityProfile.category, securityProfile.securityProfileId);
  }

  async remove(securityProfileId: string): Promise<void> {
    const securityProfile = this.securityProfiles.get(securityProfileId.trim());
    if (!securityProfile) {
      return;
    }
    this.securityProfiles.delete(securityProfile.securityProfileId);
    this.securityProfilesByName.delete(securityProfile.name);
    this.removeFromCategory(securityProfile.category, securityProfile.securityProfileId);
  }

  async findById(securityProfileId: string): Promise<SecurityProfile | null> {
    return this.securityProfiles.get(securityProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<SecurityProfile | null> {
    const securityProfileId = this.securityProfilesByName.get(name.trim());
    if (!securityProfileId) {
      return null;
    }
    return this.securityProfiles.get(securityProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly SecurityProfile[]> {
    const securityProfileIds = this.securityProfilesByCategory.get(category.trim());
    if (!securityProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...securityProfileIds]
        .map((securityProfileId) => this.securityProfiles.get(securityProfileId))
        .filter((securityProfile): securityProfile is SecurityProfile => securityProfile !== undefined),
    );
  }

  async listAll(): Promise<readonly SecurityProfile[]> {
    return Object.freeze([...this.securityProfiles.values()]);
  }

  private addToCategory(category: string, securityProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.securityProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(securityProfileId);
    this.securityProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, securityProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.securityProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(securityProfileId);
    if (categorySet.size === 0) {
      this.securityProfilesByCategory.delete(normalizedCategory);
    }
  }
}
