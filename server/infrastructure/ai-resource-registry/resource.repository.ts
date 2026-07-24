import type { IResourceRepository } from "@server/application/ai-resource-registry/contracts/resource-repository.contract";
import type { Resource } from "@server/application/ai-resource-registry/models/resource.model";

/** In-memory resource store. */
export class ResourceRepository implements IResourceRepository {
  private readonly resources = new Map<string, Resource>();
  private readonly resourcesByName = new Map<string, string>();
  private readonly resourcesByType = new Map<string, Set<string>>();

  async save(resource: Resource): Promise<void> {
    const existing = this.resources.get(resource.resourceId);
    if (existing) {
      if (existing.name !== resource.name) {
        this.resourcesByName.delete(existing.name);
      }
      if (existing.type !== resource.type) {
        this.removeFromType(existing.type, existing.resourceId);
      }
    }

    this.resources.set(resource.resourceId, resource);
    this.resourcesByName.set(resource.name, resource.resourceId);
    this.addToType(resource.type, resource.resourceId);
  }

  async findById(resourceId: string): Promise<Resource | null> {
    return this.resources.get(resourceId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Resource | null> {
    const resourceId = this.resourcesByName.get(name.trim());
    if (!resourceId) {
      return null;
    }
    return this.resources.get(resourceId) ?? null;
  }

  async findByType(type: string): Promise<readonly Resource[]> {
    const resourceIds = this.resourcesByType.get(type.trim());
    if (!resourceIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...resourceIds]
        .map((resourceId) => this.resources.get(resourceId))
        .filter((resource): resource is Resource => resource !== undefined),
    );
  }

  async findAll(): Promise<readonly Resource[]> {
    return Object.freeze([...this.resources.values()]);
  }

  async delete(resourceId: string): Promise<boolean> {
    const resource = await this.findById(resourceId);
    if (!resource) {
      return false;
    }
    this.resources.delete(resource.resourceId);
    this.resourcesByName.delete(resource.name);
    this.removeFromType(resource.type, resource.resourceId);
    return true;
  }

  private addToType(type: string, resourceId: string): void {
    const normalizedType = type.trim();
    const typeSet = this.resourcesByType.get(normalizedType) ?? new Set<string>();
    typeSet.add(resourceId);
    this.resourcesByType.set(normalizedType, typeSet);
  }

  private removeFromType(type: string, resourceId: string): void {
    const normalizedType = type.trim();
    const typeSet = this.resourcesByType.get(normalizedType);
    if (!typeSet) {
      return;
    }
    typeSet.delete(resourceId);
    if (typeSet.size === 0) {
      this.resourcesByType.delete(normalizedType);
    }
  }
}
