import type { IClusterProfileRepository } from "@server/application/ai-cluster-profile-registry/contracts/cluster-profile-repository.contract";
import type { ClusterProfile } from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";

/** In-memory cluster profile store. */
export class ClusterProfileRepository implements IClusterProfileRepository {
  private readonly clusterProfiles = new Map<string, ClusterProfile>();
  private readonly clusterProfilesByName = new Map<string, string>();
  private readonly clusterProfilesByCategory = new Map<string, Set<string>>();

  async save(clusterProfile: ClusterProfile): Promise<void> {
    const existing = this.clusterProfiles.get(clusterProfile.clusterProfileId);
    if (existing) {
      if (existing.name !== clusterProfile.name) {
        this.clusterProfilesByName.delete(existing.name);
      }
      if (existing.category !== clusterProfile.category) {
        this.removeFromCategory(existing.category, existing.clusterProfileId);
      }
    }

    this.clusterProfiles.set(clusterProfile.clusterProfileId, clusterProfile);
    this.clusterProfilesByName.set(clusterProfile.name, clusterProfile.clusterProfileId);
    this.addToCategory(clusterProfile.category, clusterProfile.clusterProfileId);
  }

  async findById(clusterProfileId: string): Promise<ClusterProfile | null> {
    return this.clusterProfiles.get(clusterProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<ClusterProfile | null> {
    const clusterProfileId = this.clusterProfilesByName.get(name.trim());
    if (!clusterProfileId) {
      return null;
    }
    return this.clusterProfiles.get(clusterProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly ClusterProfile[]> {
    const clusterProfileIds = this.clusterProfilesByCategory.get(category.trim());
    if (!clusterProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...clusterProfileIds]
        .map((clusterProfileId) => this.clusterProfiles.get(clusterProfileId))
        .filter((clusterProfile): clusterProfile is ClusterProfile => clusterProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly ClusterProfile[]> {
    return Object.freeze([...this.clusterProfiles.values()]);
  }

  async delete(clusterProfileId: string): Promise<boolean> {
    const clusterProfile = await this.findById(clusterProfileId);
    if (!clusterProfile) {
      return false;
    }
    this.clusterProfiles.delete(clusterProfile.clusterProfileId);
    this.clusterProfilesByName.delete(clusterProfile.name);
    this.removeFromCategory(clusterProfile.category, clusterProfile.clusterProfileId);
    return true;
  }

  private addToCategory(category: string, clusterProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.clusterProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(clusterProfileId);
    this.clusterProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, clusterProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.clusterProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(clusterProfileId);
    if (categorySet.size === 0) {
      this.clusterProfilesByCategory.delete(normalizedCategory);
    }
  }
}
