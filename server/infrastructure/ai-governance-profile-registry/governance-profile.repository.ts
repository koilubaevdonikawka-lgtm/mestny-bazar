import type { IGovernanceProfileRepository } from "@server/application/ai-governance-profile-registry/contracts/governance-profile-repository.contract";
import type { GovernanceProfile } from "@server/application/ai-governance-profile-registry/models/governance-profile.model";

/** In-memory governance profile store. */
export class GovernanceProfileRepository implements IGovernanceProfileRepository {
  private readonly governanceProfiles = new Map<string, GovernanceProfile>();
  private readonly governanceProfilesByName = new Map<string, string>();
  private readonly governanceProfilesByCategory = new Map<string, Set<string>>();

  async save(governanceProfile: GovernanceProfile): Promise<void> {
    const existing = this.governanceProfiles.get(governanceProfile.governanceProfileId);
    if (existing) {
      if (existing.name !== governanceProfile.name) {
        this.governanceProfilesByName.delete(existing.name);
      }
      if (existing.category !== governanceProfile.category) {
        this.removeFromCategory(existing.category, existing.governanceProfileId);
      }
    }

    this.governanceProfiles.set(governanceProfile.governanceProfileId, governanceProfile);
    this.governanceProfilesByName.set(governanceProfile.name, governanceProfile.governanceProfileId);
    this.addToCategory(governanceProfile.category, governanceProfile.governanceProfileId);
  }

  async findById(governanceProfileId: string): Promise<GovernanceProfile | null> {
    return this.governanceProfiles.get(governanceProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<GovernanceProfile | null> {
    const governanceProfileId = this.governanceProfilesByName.get(name.trim());
    if (!governanceProfileId) {
      return null;
    }
    return this.governanceProfiles.get(governanceProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly GovernanceProfile[]> {
    const governanceProfileIds = this.governanceProfilesByCategory.get(category.trim());
    if (!governanceProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...governanceProfileIds]
        .map((governanceProfileId) => this.governanceProfiles.get(governanceProfileId))
        .filter((governanceProfile): governanceProfile is GovernanceProfile => governanceProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly GovernanceProfile[]> {
    return Object.freeze([...this.governanceProfiles.values()]);
  }

  async delete(governanceProfileId: string): Promise<boolean> {
    const governanceProfile = await this.findById(governanceProfileId);
    if (!governanceProfile) {
      return false;
    }
    this.governanceProfiles.delete(governanceProfile.governanceProfileId);
    this.governanceProfilesByName.delete(governanceProfile.name);
    this.removeFromCategory(governanceProfile.category, governanceProfile.governanceProfileId);
    return true;
  }

  private addToCategory(category: string, governanceProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.governanceProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(governanceProfileId);
    this.governanceProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, governanceProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.governanceProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(governanceProfileId);
    if (categorySet.size === 0) {
      this.governanceProfilesByCategory.delete(normalizedCategory);
    }
  }
}
