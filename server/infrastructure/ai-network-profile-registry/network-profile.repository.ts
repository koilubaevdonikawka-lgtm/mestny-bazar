import type { INetworkProfileRepository } from "@server/application/ai-network-profile-registry/contracts/network-profile-repository.contract";
import type { NetworkProfile } from "@server/application/ai-network-profile-registry/models/network-profile.model";

/** In-memory network profile store. */
export class NetworkProfileRepository implements INetworkProfileRepository {
  private readonly networkProfiles = new Map<string, NetworkProfile>();
  private readonly networkProfilesByName = new Map<string, string>();
  private readonly networkProfilesByCategory = new Map<string, Set<string>>();

  async save(networkProfile: NetworkProfile): Promise<void> {
    const existing = this.networkProfiles.get(networkProfile.networkProfileId);
    if (existing) {
      if (existing.name !== networkProfile.name) {
        this.networkProfilesByName.delete(existing.name);
      }
      if (existing.category !== networkProfile.category) {
        this.removeFromCategory(existing.category, existing.networkProfileId);
      }
    }

    this.networkProfiles.set(networkProfile.networkProfileId, networkProfile);
    this.networkProfilesByName.set(networkProfile.name, networkProfile.networkProfileId);
    this.addToCategory(networkProfile.category, networkProfile.networkProfileId);
  }

  async findById(networkProfileId: string): Promise<NetworkProfile | null> {
    return this.networkProfiles.get(networkProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<NetworkProfile | null> {
    const networkProfileId = this.networkProfilesByName.get(name.trim());
    if (!networkProfileId) {
      return null;
    }
    return this.networkProfiles.get(networkProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly NetworkProfile[]> {
    const networkProfileIds = this.networkProfilesByCategory.get(category.trim());
    if (!networkProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...networkProfileIds]
        .map((networkProfileId) => this.networkProfiles.get(networkProfileId))
        .filter((networkProfile): networkProfile is NetworkProfile => networkProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly NetworkProfile[]> {
    return Object.freeze([...this.networkProfiles.values()]);
  }

  async delete(networkProfileId: string): Promise<boolean> {
    const networkProfile = await this.findById(networkProfileId);
    if (!networkProfile) {
      return false;
    }
    this.networkProfiles.delete(networkProfile.networkProfileId);
    this.networkProfilesByName.delete(networkProfile.name);
    this.removeFromCategory(networkProfile.category, networkProfile.networkProfileId);
    return true;
  }

  private addToCategory(category: string, networkProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.networkProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(networkProfileId);
    this.networkProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, networkProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.networkProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(networkProfileId);
    if (categorySet.size === 0) {
      this.networkProfilesByCategory.delete(normalizedCategory);
    }
  }
}
