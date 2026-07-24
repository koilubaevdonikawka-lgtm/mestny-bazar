import type { IRelationSerializer } from "@server/application/ai-relation-registry/contracts/relation-serializer.contract";
import {
  createRelation,
  type Relation,
} from "@server/application/ai-relation-registry/models/relation.model";

/** JSON-based relation serializer. */
export class JsonRelationSerializer implements IRelationSerializer {
  async serialize(relation: Relation): Promise<string> {
    return JSON.stringify(relation);
  }

  async deserialize(serialized: string): Promise<Relation> {
    if (!serialized.trim()) {
      throw new Error("Serialized relation cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Relation>;
    return createRelation({
      relationId: parsed.relationId ?? "",
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
