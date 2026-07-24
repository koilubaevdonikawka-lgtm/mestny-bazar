import type {
  KnowledgeNode,
  KnowledgeNodeKind,
} from "@server/platform/knowledge/knowledge/models";

/** Contract for knowledge node registration. */
export interface IKnowledgeRegistry {
  registerNode(node: KnowledgeNode): KnowledgeNode;
  getNode(nodeId: string): KnowledgeNode | undefined;
  listNodes(kind?: KnowledgeNodeKind): readonly KnowledgeNode[];
}
