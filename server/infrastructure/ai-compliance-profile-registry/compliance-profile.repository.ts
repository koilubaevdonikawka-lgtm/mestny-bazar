import type { IComplianceProfileRepository } from "@server/application/ai-compliance-profile-registry/contracts/compliance-profile-repository.contract";
import type { ComplianceProfile } from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";

/** In-memory compliance profile store. */
export class ComplianceProfileRepository implements IComplianceProfileRepository {
  private readonly complianceProfiles = new Map<string, ComplianceProfile>();
  private readonly complianceProfilesByName = new Map<string, string>();
  private readonly complianceProfilesByCategory = new Map<string, Set<string>>();

  async save(complianceProfile: ComplianceProfile): Promise<void> {
    const existing = this.complianceProfiles.get(complianceProfile.complianceProfileId);
    if (existing) {
      if (existing.name !== complianceProfile.name) {
        this.complianceProfilesByName.delete(existing.name);
      }
      if (existing.category !== complianceProfile.category) {
        this.removeFromCategory(existing.category, existing.complianceProfileId);
      }
    }

    this.complianceProfiles.set(complianceProfile.complianceProfileId, complianceProfile);
    this.complianceProfilesByName.set(complianceProfile.name, complianceProfile.complianceProfileId);
    this.addToCategory(complianceProfile.category, complianceProfile.complianceProfileId);
  }

  async findById(complianceProfileId: string): Promise<ComplianceProfile | null> {
    return this.complianceProfiles.get(complianceProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<ComplianceProfile | null> {
    const complianceProfileId = this.complianceProfilesByName.get(name.trim());
    if (!complianceProfileId) {
      return null;
    }
    return this.complianceProfiles.get(complianceProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly ComplianceProfile[]> {
    const complianceProfileIds = this.complianceProfilesByCategory.get(category.trim());
    if (!complianceProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...complianceProfileIds]
        .map((complianceProfileId) => this.complianceProfiles.get(complianceProfileId))
        .filter((complianceProfile): complianceProfile is ComplianceProfile => complianceProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly ComplianceProfile[]> {
    return Object.freeze([...this.complianceProfiles.values()]);
  }

  async delete(complianceProfileId: string): Promise<boolean> {
    const complianceProfile = await this.findById(complianceProfileId);
    if (!complianceProfile) {
      return false;
    }
    this.complianceProfiles.delete(complianceProfile.complianceProfileId);
    this.complianceProfilesByName.delete(complianceProfile.name);
    this.removeFromCategory(complianceProfile.category, complianceProfile.complianceProfileId);
    return true;
  }

  private addToCategory(category: string, complianceProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.complianceProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(complianceProfileId);
    this.complianceProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, complianceProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.complianceProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(complianceProfileId);
    if (categorySet.size === 0) {
      this.complianceProfilesByCategory.delete(normalizedCategory);
    }
  }
}
