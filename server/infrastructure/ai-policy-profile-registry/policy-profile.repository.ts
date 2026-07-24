import type { IPolicyProfileRepository } from "@server/application/ai-policy-profile-registry/contracts/policy-profile-repository.contract";
import type { PolicyProfile } from "@server/application/ai-policy-profile-registry/models/policy-profile.model";

/** In-memory policy profile store. */
export class PolicyProfileRepository implements IPolicyProfileRepository {
  private readonly policyProfiles = new Map<string, PolicyProfile>();
  private readonly policyProfilesByName = new Map<string, string>();
  private readonly policyProfilesByCategory = new Map<string, Set<string>>();

  async save(policyProfile: PolicyProfile): Promise<void> {
    const existing = this.policyProfiles.get(policyProfile.policyProfileId);
    if (existing) {
      if (existing.name !== policyProfile.name) {
        this.policyProfilesByName.delete(existing.name);
      }
      if (existing.category !== policyProfile.category) {
        this.removeFromCategory(existing.category, existing.policyProfileId);
      }
    }

    this.policyProfiles.set(policyProfile.policyProfileId, policyProfile);
    this.policyProfilesByName.set(policyProfile.name, policyProfile.policyProfileId);
    this.addToCategory(policyProfile.category, policyProfile.policyProfileId);
  }

  async findById(policyProfileId: string): Promise<PolicyProfile | null> {
    return this.policyProfiles.get(policyProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<PolicyProfile | null> {
    const policyProfileId = this.policyProfilesByName.get(name.trim());
    if (!policyProfileId) {
      return null;
    }
    return this.policyProfiles.get(policyProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly PolicyProfile[]> {
    const policyProfileIds = this.policyProfilesByCategory.get(category.trim());
    if (!policyProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...policyProfileIds]
        .map((policyProfileId) => this.policyProfiles.get(policyProfileId))
        .filter((policyProfile): policyProfile is PolicyProfile => policyProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly PolicyProfile[]> {
    return Object.freeze([...this.policyProfiles.values()]);
  }

  async delete(policyProfileId: string): Promise<boolean> {
    const policyProfile = await this.findById(policyProfileId);
    if (!policyProfile) {
      return false;
    }
    this.policyProfiles.delete(policyProfile.policyProfileId);
    this.policyProfilesByName.delete(policyProfile.name);
    this.removeFromCategory(policyProfile.category, policyProfile.policyProfileId);
    return true;
  }

  private addToCategory(category: string, policyProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.policyProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(policyProfileId);
    this.policyProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, policyProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.policyProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(policyProfileId);
    if (categorySet.size === 0) {
      this.policyProfilesByCategory.delete(normalizedCategory);
    }
  }
}
