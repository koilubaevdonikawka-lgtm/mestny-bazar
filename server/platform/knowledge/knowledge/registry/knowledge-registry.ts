import type { IKnowledgeRegistry } from "@server/platform/knowledge/knowledge/contracts";
import {
  createKnowledgeNode,
  type KnowledgeNode,
  type KnowledgeNodeKind,
} from "@server/platform/knowledge/knowledge/models";
import { createKnowledgeNodeRegisteredEvent } from "@server/platform/knowledge/knowledge/events";

/** Central registry for knowledge graph nodes. */
export class KnowledgeRegistry implements IKnowledgeRegistry {
  private readonly nodes = new Map<string, KnowledgeNode>();

  registerNode(node: KnowledgeNode): KnowledgeNode {
    const stored = createKnowledgeNode(node);
    this.nodes.set(stored.id, stored);
    createKnowledgeNodeRegisteredEvent(stored);
    return stored;
  }

  getNode(nodeId: string): KnowledgeNode | undefined {
    return this.nodes.get(nodeId.trim());
  }

  listNodes(kind?: KnowledgeNodeKind): readonly KnowledgeNode[] {
    const values = [...this.nodes.values()];
    const filtered = kind ? values.filter((node) => node.kind === kind) : values;
    return Object.freeze([...filtered]);
  }
}
