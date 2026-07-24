import type { IKnowledgeGraphEngine } from "@server/platform/knowledge/knowledge/contracts";
import type { IKnowledgeRegistry } from "@server/platform/knowledge/knowledge/contracts";
import type { IRelationRegistry } from "@server/platform/knowledge/knowledge/contracts";
import {
  createKnowledgeGraph,
  type KnowledgeGraph,
  type KnowledgeNode,
  type KnowledgeRelation,
} from "@server/platform/knowledge/knowledge/models";
import { createKnowledgeGraphGeneratedEvent } from "@server/platform/knowledge/knowledge/events";

/** Directed typed knowledge graph engine (metadata only). */
export class KnowledgeGraphEngine implements IKnowledgeGraphEngine {
  constructor(
    private readonly nodeRegistry: IKnowledgeRegistry,
    private readonly relationRegistry: IRelationRegistry,
  ) {}

  addNode(node: KnowledgeNode): void {
    if (!this.nodeRegistry.getNode(node.id)) {
      this.nodeRegistry.registerNode(node);
    }
  }

  addRelation(relation: KnowledgeRelation): void {
    this.relationRegistry.register(relation);
  }

  traverse(nodeId: string, depth = 2): readonly KnowledgeNode[] {
    const visited = new Set<string>();
    const queue: Array<{ id: string; level: number }> = [{ id: nodeId.trim(), level: 0 }];
    const result: KnowledgeNode[] = [];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || visited.has(current.id) || current.level > depth) {
        continue;
      }
      visited.add(current.id);
      const node = this.nodeRegistry.getNode(current.id);
      if (node) {
        result.push(node);
      }
      for (const relation of this.relationRegistry.listBySource(current.id)) {
        queue.push({ id: relation.targetId, level: current.level + 1 });
      }
      for (const relation of this.relationRegistry.listByTarget(current.id)) {
        queue.push({ id: relation.sourceId, level: current.level + 1 });
      }
    }

    return Object.freeze([...result]);
  }

  generate(): KnowledgeGraph {
    const graph = createKnowledgeGraph({
      nodes: this.nodeRegistry.listNodes(),
      relations: this.relationRegistry.list(),
    });
    createKnowledgeGraphGeneratedEvent(graph);
    return graph;
  }
}
