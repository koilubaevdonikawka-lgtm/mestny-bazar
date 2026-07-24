import type {
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeQuery,
  KnowledgeRelation,
  KnowledgeResult,
} from "@server/platform/knowledge/knowledge/models";

/** Contract for knowledge graph orchestration. */
export interface IKnowledgeManager {
  registerNode(node: KnowledgeNode): KnowledgeNode;
  registerRelation(relation: KnowledgeRelation): KnowledgeRelation;
  discoverKnowledge(): readonly KnowledgeNode[];
  queryKnowledge(query: KnowledgeQuery): KnowledgeResult;
  generateGraph(): KnowledgeGraph;
}
