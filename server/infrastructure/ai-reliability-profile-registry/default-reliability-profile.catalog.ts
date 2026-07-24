import type { IReliabilityProfileCatalog } from "@server/application/ai-reliability-profile-registry/contracts/reliability-profile-catalog.contract";
import type { ReliabilityProfile } from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";

/** Default in-memory reliability profile catalog index. */
export class DefaultReliabilityProfileCatalog implements IReliabilityProfileCatalog {
  private readonly reliabilityProfiles = new Map<string, ReliabilityProfile>();
  private readonly reliabilityProfilesByName = new Map<string, string>();
  private readonly reliabilityProfilesByCategory = new Map<string, Set<string>>();

  async register(reliabilityProfile: ReliabilityProfile): Promise<void> {
    const existing = this.reliabilityProfiles.get(reliabilityProfile.reliabilityProfileId);
    if (existing) {
      if (existing.name !== reliabilityProfile.name) {
        this.reliabilityProfilesByName.delete(existing.name);
      }
      if (existing.category !== reliabilityProfile.category) {
        this.removeFromCategory(existing.category, existing.reliabilityProfileId);
      }
    }

    this.reliabilityProfiles.set(reliabilityProfile.reliabilityProfileId, reliabilityProfile);
    this.reliabilityProfilesByName.set(reliabilityProfile.name, reliabilityProfile.reliabilityProfileId);
    this.addToCategory(reliabilityProfile.category, reliabilityProfile.reliabilityProfileId);
  }

  async remove(reliabilityProfileId: string): Promise<void> {
    const reliabilityProfile = this.reliabilityProfiles.get(reliabilityProfileId.trim());
    if (!reliabilityProfile) {
      return;
    }
    this.reliabilityProfiles.delete(reliabilityProfile.reliabilityProfileId);
    this.reliabilityProfilesByName.delete(reliabilityProfile.name);
    this.removeFromCategory(reliabilityProfile.category, reliabilityProfile.reliabilityProfileId);
  }

  async findById(reliabilityProfileId: string): Promise<ReliabilityProfile | null> {
    return this.reliabilityProfiles.get(reliabilityProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<ReliabilityProfile | null> {
    const reliabilityProfileId = this.reliabilityProfilesByName.get(name.trim());
    if (!reliabilityProfileId) {
      return null;
    }
    return this.reliabilityProfiles.get(reliabilityProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly ReliabilityProfile[]> {
    const reliabilityProfileIds = this.reliabilityProfilesByCategory.get(category.trim());
    if (!reliabilityProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...reliabilityProfileIds]
        .map((reliabilityProfileId) => this.reliabilityProfiles.get(reliabilityProfileId))
        .filter((reliabilityProfile): reliabilityProfile is ReliabilityProfile => reliabilityProfile !== undefined),
    );
  }

  async listAll(): Promise<readonly ReliabilityProfile[]> {
    return Object.freeze([...this.reliabilityProfiles.values()]);
  }

  private addToCategory(category: string, reliabilityProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.reliabilityProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(reliabilityProfileId);
    this.reliabilityProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, reliabilityProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.reliabilityProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(reliabilityProfileId);
    if (categorySet.size === 0) {
      this.reliabilityProfilesByCategory.delete(normalizedCategory);
    }
  }
}
