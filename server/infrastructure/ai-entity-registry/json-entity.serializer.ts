import type { IEntitySerializer } from "@server/application/ai-entity-registry/contracts/entity-serializer.contract";
import {
  createEntity,
  type Entity,
} from "@server/application/ai-entity-registry/models/entity.model";

/** JSON-based entity serializer. */
export class JsonEntitySerializer implements IEntitySerializer {
  async serialize(entity: Entity): Promise<string> {
    return JSON.stringify(entity);
  }

  async deserialize(serialized: string): Promise<Entity> {
    if (!serialized.trim()) {
      throw new Error("Serialized entity cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Entity>;
    return createEntity({
      entityId: parsed.entityId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
