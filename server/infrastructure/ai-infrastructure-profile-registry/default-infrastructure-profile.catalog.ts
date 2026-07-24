import type { IInfrastructureProfileCatalog } from "@server/application/ai-infrastructure-profile-registry/contracts/infrastructure-profile-catalog.contract";
import type { InfrastructureProfile } from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";

/** Default in-memory infrastructure profile catalog index. */
export class DefaultInfrastructureProfileCatalog implements IInfrastructureProfileCatalog {
  private readonly infrastructureProfiles = new Map<string, InfrastructureProfile>();
  private readonly infrastructureProfilesByName = new Map<string, string>();
  private readonly infrastructureProfilesByCategory = new Map<string, Set<string>>();

  async register(infrastructureProfile: InfrastructureProfile): Promise<void> {
    const existing = this.infrastructureProfiles.get(infrastructureProfile.infrastructureProfileId);
    if (existing) {
      if (existing.name !== infrastructureProfile.name) {
        this.infrastructureProfilesByName.delete(existing.name);
      }
      if (existing.category !== infrastructureProfile.category) {
        this.removeFromCategory(existing.category, existing.infrastructureProfileId);
      }
    }

    this.infrastructureProfiles.set(infrastructureProfile.infrastructureProfileId, infrastructureProfile);
    this.infrastructureProfilesByName.set(
      infrastructureProfile.name,
      infrastructureProfile.infrastructureProfileId,
    );
    this.addToCategory(infrastructureProfile.category, infrastructureProfile.infrastructureProfileId);
  }

  async remove(infrastructureProfileId: string): Promise<void> {
    const infrastructureProfile = this.infrastructureProfiles.get(infrastructureProfileId.trim());
    if (!infrastructureProfile) {
      return;
    }
    this.infrastructureProfiles.delete(infrastructureProfile.infrastructureProfileId);
    this.infrastructureProfilesByName.delete(infrastructureProfile.name);
    this.removeFromCategory(infrastructureProfile.category, infrastructureProfile.infrastructureProfileId);
  }

  async findById(infrastructureProfileId: string): Promise<InfrastructureProfile | null> {
    return this.infrastructureProfiles.get(infrastructureProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<InfrastructureProfile | null> {
    const infrastructureProfileId = this.infrastructureProfilesByName.get(name.trim());
    if (!infrastructureProfileId) {
      return null;
    }
    return this.infrastructureProfiles.get(infrastructureProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly InfrastructureProfile[]> {
    const infrastructureProfileIds = this.infrastructureProfilesByCategory.get(category.trim());
    if (!infrastructureProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...infrastructureProfileIds]
        .map((infrastructureProfileId) => this.infrastructureProfiles.get(infrastructureProfileId))
        .filter(
          (infrastructureProfile): infrastructureProfile is InfrastructureProfile =>
            infrastructureProfile !== undefined,
        ),
    );
  }

  async listAll(): Promise<readonly InfrastructureProfile[]> {
    return Object.freeze([...this.infrastructureProfiles.values()]);
  }

  private addToCategory(category: string, infrastructureProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet =
      this.infrastructureProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(infrastructureProfileId);
    this.infrastructureProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, infrastructureProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.infrastructureProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(infrastructureProfileId);
    if (categorySet.size === 0) {
      this.infrastructureProfilesByCategory.delete(normalizedCategory);
    }
  }
}
