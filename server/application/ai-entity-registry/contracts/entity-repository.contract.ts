import type { Entity } from "@server/application/ai-entity-registry/models/entity.model";

export interface IEntityRepository {
  save(entity: Entity): Promise<void>;
  findById(entityId: string): Promise<Entity | null>;
  findByName(name: string): Promise<Entity | null>;
  findByCategory(category: string): Promise<readonly Entity[]>;
  findAll(): Promise<readonly Entity[]>;
  delete(entityId: string): Promise<boolean>;
}
