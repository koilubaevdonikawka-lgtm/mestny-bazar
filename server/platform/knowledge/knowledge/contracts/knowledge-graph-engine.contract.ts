import type {
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeRelation,
} from "@server/platform/knowledge/knowledge/models";

/** Contract for knowledge graph engine (metadata only). */
export interface IKnowledgeGraphEngine {
  addNode(node: KnowledgeNode): void;
  addRelation(relation: KnowledgeRelation): void;
  traverse(nodeId: string, depth?: number): readonly KnowledgeNode[];
  generate(): KnowledgeGraph;
}
