import type { Relation } from "@server/application/ai-relation-registry/models/relation.model";

export interface IRelationSerializer {
  serialize(relation: Relation): Promise<string>;
  deserialize(serialized: string): Promise<Relation>;
}
