import type { Entity } from "@server/application/ai-entity-registry/models/entity.model";

export interface IEntityCatalog {
  register(entity: Entity): Promise<void>;
  remove(entityId: string): Promise<void>;
  findById(entityId: string): Promise<Entity | null>;
  findByName(name: string): Promise<Entity | null>;
  findByCategory(category: string): Promise<readonly Entity[]>;
  listAll(): Promise<readonly Entity[]>;
}
