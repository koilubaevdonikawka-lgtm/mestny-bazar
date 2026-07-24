import type { Relation } from "@server/application/ai-relation-registry/models/relation.model";

export interface IRelationCatalog {
  register(relation: Relation): Promise<void>;
  remove(relationId: string): Promise<void>;
  findById(relationId: string): Promise<Relation | null>;
  findByName(name: string): Promise<Relation | null>;
  findByCategory(category: string): Promise<readonly Relation[]>;
  listAll(): Promise<readonly Relation[]>;
}
