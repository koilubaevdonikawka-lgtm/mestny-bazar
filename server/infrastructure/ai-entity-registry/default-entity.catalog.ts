import type { IEntityCatalog } from "@server/application/ai-entity-registry/contracts/entity-catalog.contract";
import type { Entity } from "@server/application/ai-entity-registry/models/entity.model";

/** Default in-memory entity catalog index. */
export class DefaultEntityCatalog implements IEntityCatalog {
  private readonly entities = new Map<string, Entity>();
  private readonly entitiesByName = new Map<string, string>();
  private readonly entitiesByCategory = new Map<string, Set<string>>();

  async register(entity: Entity): Promise<void> {
    const existing = this.entities.get(entity.entityId);
    if (existing) {
      if (existing.name !== entity.name) {
        this.entitiesByName.delete(existing.name);
      }
      if (existing.category !== entity.category) {
        this.removeFromCategory(existing.category, existing.entityId);
      }
    }

    this.entities.set(entity.entityId, entity);
    this.entitiesByName.set(entity.name, entity.entityId);
    this.addToCategory(entity.category, entity.entityId);
  }

  async remove(entityId: string): Promise<void> {
    const entity = this.entities.get(entityId.trim());
    if (!entity) {
      return;
    }
    this.entities.delete(entity.entityId);
    this.entitiesByName.delete(entity.name);
    this.removeFromCategory(entity.category, entity.entityId);
  }

  async findById(entityId: string): Promise<Entity | null> {
    return this.entities.get(entityId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Entity | null> {
    const entityId = this.entitiesByName.get(name.trim());
    if (!entityId) {
      return null;
    }
    return this.entities.get(entityId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Entity[]> {
    const entityIds = this.entitiesByCategory.get(category.trim());
    if (!entityIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...entityIds]
        .map((entityId) => this.entities.get(entityId))
        .filter((entity): entity is Entity => entity !== undefined),
    );
  }

  async listAll(): Promise<readonly Entity[]> {
    return Object.freeze([...this.entities.values()]);
  }

  private addToCategory(category: string, entityId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.entitiesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(entityId);
    this.entitiesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, entityId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.entitiesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(entityId);
    if (categorySet.size === 0) {
      this.entitiesByCategory.delete(normalizedCategory);
    }
  }
}
