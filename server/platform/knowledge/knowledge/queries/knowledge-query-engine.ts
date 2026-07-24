import type { IKnowledgeQueryEngine } from "@server/platform/knowledge/knowledge/contracts";
import type { IKnowledgeRegistry } from "@server/platform/knowledge/knowledge/contracts";
import type { IRelationRegistry } from "@server/platform/knowledge/knowledge/contracts";
import type { IKnowledgeGraphEngine } from "@server/platform/knowledge/knowledge/contracts";
import {
  createKnowledgeQuery,
  createKnowledgeResult,
  type KnowledgeQuery,
  type KnowledgeResult,
} from "@server/platform/knowledge/knowledge/models";
import { createKnowledgeQueryExecutedEvent } from "@server/platform/knowledge/knowledge/events";

/** Executes knowledge graph queries (metadata only). */
export class KnowledgeQueryEngine implements IKnowledgeQueryEngine {
  constructor(
    private readonly nodeRegistry: IKnowledgeRegistry,
    private readonly relationRegistry: IRelationRegistry,
    private readonly graphEngine: IKnowledgeGraphEngine,
  ) {}

  execute(query: KnowledgeQuery): KnowledgeResult {
    let result: KnowledgeResult;
    switch (query.kind) {
      case "node":
        result = this.findNode(query.targetId ?? "");
        break;
      case "relations":
        result = this.findRelations(query.targetId ?? "");
        break;
      case "dependencies":
        result = this.findDependencies(query.targetId ?? "");
        break;
      case "providers":
        result = this.findProviders();
        break;
      case "capabilities":
        result = this.findCapabilities();
        break;
      default:
        result = createKnowledgeResult({ query });
    }
    createKnowledgeQueryExecutedEvent(result);
    return result;
  }

  findNode(nodeId: string): KnowledgeResult {
    const node = this.nodeRegistry.getNode(nodeId);
    return createKnowledgeResult({
      query: createKnowledgeQuery({ kind: "node", targetId: nodeId }),
      nodes: node ? [node] : [],
    });
  }

  findRelations(nodeId: string): KnowledgeResult {
    const relations = [
      ...this.relationRegistry.listBySource(nodeId),
      ...this.relationRegistry.listByTarget(nodeId),
    ];
    const nodeIds = new Set<string>([nodeId]);
    for (const relation of relations) {
      nodeIds.add(relation.sourceId);
      nodeIds.add(relation.targetId);
    }
    const nodes = [...nodeIds]
      .map((id) => this.nodeRegistry.getNode(id))
      .filter((node): node is NonNullable<typeof node> => Boolean(node));
    return createKnowledgeResult({
      query: createKnowledgeQuery({ kind: "relations", targetId: nodeId }),
      nodes,
      relations,
    });
  }

  findDependencies(nodeId: string): KnowledgeResult {
    const relations = this.relationRegistry
      .list("depends-on")
      .filter((relation) => relation.sourceId === nodeId.trim());
    const nodes = relations
      .map((relation) => this.nodeRegistry.getNode(relation.targetId))
      .filter((node): node is NonNullable<typeof node> => Boolean(node));
    return createKnowledgeResult({
      query: createKnowledgeQuery({ kind: "dependencies", targetId: nodeId }),
      nodes,
      relations,
    });
  }

  findProviders(): KnowledgeResult {
    const nodes = this.nodeRegistry.listNodes("provider");
    return createKnowledgeResult({
      query: createKnowledgeQuery({ kind: "providers" }),
      nodes,
    });
  }

  findCapabilities(): KnowledgeResult {
    const nodes = this.nodeRegistry.listNodes().filter(
      (node) =>
        node.id.includes("capability") ||
        node.metadata["source"] === "capability-catalog",
    );
    return createKnowledgeResult({
      query: createKnowledgeQuery({ kind: "capabilities" }),
      nodes,
    });
  }
}
