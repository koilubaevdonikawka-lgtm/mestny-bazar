import type { Relation } from "@server/application/ai-relation-registry/models/relation.model";

export interface IRelationRepository {
  save(relation: Relation): Promise<void>;
  findById(relationId: string): Promise<Relation | null>;
  findByName(name: string): Promise<Relation | null>;
  findByCategory(category: string): Promise<readonly Relation[]>;
  findAll(): Promise<readonly Relation[]>;
  delete(relationId: string): Promise<boolean>;
}
