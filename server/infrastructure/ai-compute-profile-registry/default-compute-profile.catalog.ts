import type { IComputeProfileCatalog } from "@server/application/ai-compute-profile-registry/contracts/compute-profile-catalog.contract";
import type { ComputeProfile } from "@server/application/ai-compute-profile-registry/models/compute-profile.model";

/** Default in-memory compute profile catalog index. */
export class DefaultComputeProfileCatalog implements IComputeProfileCatalog {
  private readonly computeProfiles = new Map<string, ComputeProfile>();
  private readonly computeProfilesByName = new Map<string, string>();
  private readonly computeProfilesByCategory = new Map<string, Set<string>>();

  async register(computeProfile: ComputeProfile): Promise<void> {
    const existing = this.computeProfiles.get(computeProfile.computeProfileId);
    if (existing) {
      if (existing.name !== computeProfile.name) {
        this.computeProfilesByName.delete(existing.name);
      }
      if (existing.category !== computeProfile.category) {
        this.removeFromCategory(existing.category, existing.computeProfileId);
      }
    }

    this.computeProfiles.set(computeProfile.computeProfileId, computeProfile);
    this.computeProfilesByName.set(computeProfile.name, computeProfile.computeProfileId);
    this.addToCategory(computeProfile.category, computeProfile.computeProfileId);
  }

  async remove(computeProfileId: string): Promise<void> {
    const computeProfile = this.computeProfiles.get(computeProfileId.trim());
    if (!computeProfile) {
      return;
    }
    this.computeProfiles.delete(computeProfile.computeProfileId);
    this.computeProfilesByName.delete(computeProfile.name);
    this.removeFromCategory(computeProfile.category, computeProfile.computeProfileId);
  }

  async findById(computeProfileId: string): Promise<ComputeProfile | null> {
    return this.computeProfiles.get(computeProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<ComputeProfile | null> {
    const computeProfileId = this.computeProfilesByName.get(name.trim());
    if (!computeProfileId) {
      return null;
    }
    return this.computeProfiles.get(computeProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly ComputeProfile[]> {
    const computeProfileIds = this.computeProfilesByCategory.get(category.trim());
    if (!computeProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...computeProfileIds]
        .map((computeProfileId) => this.computeProfiles.get(computeProfileId))
        .filter((computeProfile): computeProfile is ComputeProfile => computeProfile !== undefined),
    );
  }

  async listAll(): Promise<readonly ComputeProfile[]> {
    return Object.freeze([...this.computeProfiles.values()]);
  }

  private addToCategory(category: string, computeProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.computeProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(computeProfileId);
    this.computeProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, computeProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.computeProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(computeProfileId);
    if (categorySet.size === 0) {
      this.computeProfilesByCategory.delete(normalizedCategory);
    }
  }
}
