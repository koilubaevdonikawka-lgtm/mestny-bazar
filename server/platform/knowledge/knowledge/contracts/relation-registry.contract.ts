import type {
  KnowledgeRelation,
  KnowledgeRelationKind,
} from "@server/platform/knowledge/knowledge/models";

/** Contract for knowledge relation registration. */
export interface IRelationRegistry {
  register(relation: KnowledgeRelation): KnowledgeRelation;
  list(kind?: KnowledgeRelationKind): readonly KnowledgeRelation[];
  listBySource(sourceId: string): readonly KnowledgeRelation[];
  listByTarget(targetId: string): readonly KnowledgeRelation[];
}
