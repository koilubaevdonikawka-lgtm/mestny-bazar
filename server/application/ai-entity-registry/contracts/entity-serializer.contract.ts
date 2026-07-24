import type { Entity } from "@server/application/ai-entity-registry/models/entity.model";

export interface IEntitySerializer {
  serialize(entity: Entity): Promise<string>;
  deserialize(serialized: string): Promise<Entity>;
}
