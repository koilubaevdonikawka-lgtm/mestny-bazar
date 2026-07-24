import type { INodeProfileRepository } from "@server/application/ai-node-profile-registry/contracts/node-profile-repository.contract";
import type { NodeProfile } from "@server/application/ai-node-profile-registry/models/node-profile.model";

/** In-memory node profile store. */
export class NodeProfileRepository implements INodeProfileRepository {
  private readonly nodeProfiles = new Map<string, NodeProfile>();
  private readonly nodeProfilesByName = new Map<string, string>();
  private readonly nodeProfilesByCategory = new Map<string, Set<string>>();

  async save(nodeProfile: NodeProfile): Promise<void> {
    const existing = this.nodeProfiles.get(nodeProfile.nodeProfileId);
    if (existing) {
      if (existing.name !== nodeProfile.name) {
        this.nodeProfilesByName.delete(existing.name);
      }
      if (existing.category !== nodeProfile.category) {
        this.removeFromCategory(existing.category, existing.nodeProfileId);
      }
    }

    this.nodeProfiles.set(nodeProfile.nodeProfileId, nodeProfile);
    this.nodeProfilesByName.set(nodeProfile.name, nodeProfile.nodeProfileId);
    this.addToCategory(nodeProfile.category, nodeProfile.nodeProfileId);
  }

  async findById(nodeProfileId: string): Promise<NodeProfile | null> {
    return this.nodeProfiles.get(nodeProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<NodeProfile | null> {
    const nodeProfileId = this.nodeProfilesByName.get(name.trim());
    if (!nodeProfileId) {
      return null;
    }
    return this.nodeProfiles.get(nodeProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly NodeProfile[]> {
    const nodeProfileIds = this.nodeProfilesByCategory.get(category.trim());
    if (!nodeProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...nodeProfileIds]
        .map((nodeProfileId) => this.nodeProfiles.get(nodeProfileId))
        .filter((nodeProfile): nodeProfile is NodeProfile => nodeProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly NodeProfile[]> {
    return Object.freeze([...this.nodeProfiles.values()]);
  }

  async delete(nodeProfileId: string): Promise<boolean> {
    const nodeProfile = await this.findById(nodeProfileId);
    if (!nodeProfile) {
      return false;
    }
    this.nodeProfiles.delete(nodeProfile.nodeProfileId);
    this.nodeProfilesByName.delete(nodeProfile.name);
    this.removeFromCategory(nodeProfile.category, nodeProfile.nodeProfileId);
    return true;
  }

  private addToCategory(category: string, nodeProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.nodeProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(nodeProfileId);
    this.nodeProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, nodeProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.nodeProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(nodeProfileId);
    if (categorySet.size === 0) {
      this.nodeProfilesByCategory.delete(normalizedCategory);
    }
  }
}
