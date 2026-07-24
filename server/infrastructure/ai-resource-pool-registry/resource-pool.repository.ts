import type { IResourcePoolRepository } from "@server/application/ai-resource-pool-registry/contracts/resource-pool-repository.contract";
import type { ResourcePool } from "@server/application/ai-resource-pool-registry/models/resource-pool.model";

/** In-memory resource pool store. */
export class ResourcePoolRepository implements IResourcePoolRepository {
  private readonly resourcePools = new Map<string, ResourcePool>();
  private readonly resourcePoolsByName = new Map<string, string>();
  private readonly resourcePoolsByCategory = new Map<string, Set<string>>();

  async save(resourcePool: ResourcePool): Promise<void> {
    const existing = this.resourcePools.get(resourcePool.resourcePoolId);
    if (existing) {
      if (existing.name !== resourcePool.name) {
        this.resourcePoolsByName.delete(existing.name);
      }
      if (existing.category !== resourcePool.category) {
        this.removeFromCategory(existing.category, existing.resourcePoolId);
      }
    }

    this.resourcePools.set(resourcePool.resourcePoolId, resourcePool);
    this.resourcePoolsByName.set(resourcePool.name, resourcePool.resourcePoolId);
    this.addToCategory(resourcePool.category, resourcePool.resourcePoolId);
  }

  async findById(resourcePoolId: string): Promise<ResourcePool | null> {
    return this.resourcePools.get(resourcePoolId.trim()) ?? null;
  }

  async findByName(name: string): Promise<ResourcePool | null> {
    const resourcePoolId = this.resourcePoolsByName.get(name.trim());
    if (!resourcePoolId) {
      return null;
    }
    return this.resourcePools.get(resourcePoolId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly ResourcePool[]> {
    const resourcePoolIds = this.resourcePoolsByCategory.get(category.trim());
    if (!resourcePoolIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...resourcePoolIds]
        .map((resourcePoolId) => this.resourcePools.get(resourcePoolId))
        .filter((resourcePool): resourcePool is ResourcePool => resourcePool !== undefined),
    );
  }

  async findAll(): Promise<readonly ResourcePool[]> {
    return Object.freeze([...this.resourcePools.values()]);
  }

  async delete(resourcePoolId: string): Promise<boolean> {
    const resourcePool = await this.findById(resourcePoolId);
    if (!resourcePool) {
      return false;
    }
    this.resourcePools.delete(resourcePool.resourcePoolId);
    this.resourcePoolsByName.delete(resourcePool.name);
    this.removeFromCategory(resourcePool.category, resourcePool.resourcePoolId);
    return true;
  }

  private addToCategory(category: string, resourcePoolId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.resourcePoolsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(resourcePoolId);
    this.resourcePoolsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, resourcePoolId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.resourcePoolsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(resourcePoolId);
    if (categorySet.size === 0) {
      this.resourcePoolsByCategory.delete(normalizedCategory);
    }
  }
}
