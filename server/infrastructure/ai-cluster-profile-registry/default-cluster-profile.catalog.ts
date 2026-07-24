import type { IClusterProfileCatalog } from "@server/application/ai-cluster-profile-registry/contracts/cluster-profile-catalog.contract";
import type { ClusterProfile } from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";

/** Default in-memory cluster profile catalog index. */
export class DefaultClusterProfileCatalog implements IClusterProfileCatalog {
  private readonly clusterProfiles = new Map<string, ClusterProfile>();
  private readonly clusterProfilesByName = new Map<string, string>();
  private readonly clusterProfilesByCategory = new Map<string, Set<string>>();

  async register(clusterProfile: ClusterProfile): Promise<void> {
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

  async remove(clusterProfileId: string): Promise<void> {
    const clusterProfile = this.clusterProfiles.get(clusterProfileId.trim());
    if (!clusterProfile) {
      return;
    }
    this.clusterProfiles.delete(clusterProfile.clusterProfileId);
    this.clusterProfilesByName.delete(clusterProfile.name);
    this.removeFromCategory(clusterProfile.category, clusterProfile.clusterProfileId);
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

  async listAll(): Promise<readonly ClusterProfile[]> {
    return Object.freeze([...this.clusterProfiles.values()]);
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
