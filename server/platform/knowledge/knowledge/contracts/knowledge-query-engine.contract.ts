import type {
  KnowledgeQuery,
  KnowledgeResult,
} from "@server/platform/knowledge/knowledge/models";

/** Contract for knowledge graph queries (metadata only). */
export interface IKnowledgeQueryEngine {
  execute(query: KnowledgeQuery): KnowledgeResult;
  findNode(nodeId: string): KnowledgeResult;
  findRelations(nodeId: string): KnowledgeResult;
  findDependencies(nodeId: string): KnowledgeResult;
  findProviders(): KnowledgeResult;
  findCapabilities(): KnowledgeResult;
}
