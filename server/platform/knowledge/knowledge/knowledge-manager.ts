import type { IKnowledgeManager } from "@server/platform/knowledge/knowledge/contracts";
import type { IKnowledgeRegistry } from "@server/platform/knowledge/knowledge/contracts";
import type { IRelationRegistry } from "@server/platform/knowledge/knowledge/contracts";
import type { IKnowledgeDiscoveryEngine } from "@server/platform/knowledge/knowledge/contracts";
import type { IKnowledgeQueryEngine } from "@server/platform/knowledge/knowledge/contracts";
import type { IKnowledgeGraphEngine } from "@server/platform/knowledge/knowledge/contracts";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import {
  createKnowledgeRelation,
  type KnowledgeGraph,
  type KnowledgeNode,
  type KnowledgeQuery,
  type KnowledgeRelation,
  type KnowledgeRelationKind,
  type KnowledgeResult,
} from "@server/platform/knowledge/knowledge/models";

/** Orchestrates knowledge graph registration, discovery and queries. */
export class KnowledgeManager implements IKnowledgeManager {
  constructor(
    private readonly nodeRegistry: IKnowledgeRegistry,
    private readonly relationRegistry: IRelationRegistry,
    private readonly discoveryEngine: IKnowledgeDiscoveryEngine,
    private readonly queryEngine: IKnowledgeQueryEngine,
    private readonly graphEngine: IKnowledgeGraphEngine,
    private readonly documentation: DocumentationPlatform,
    private readonly capabilityPlatform: CapabilityPlatform,
  ) {}

  registerNode(node: KnowledgeNode): KnowledgeNode {
    const stored = this.nodeRegistry.registerNode(node);
    this.graphEngine.addNode(stored);
    return stored;
  }

  registerRelation(relation: KnowledgeRelation): KnowledgeRelation {
    const stored = this.relationRegistry.register(relation);
    this.graphEngine.addRelation(stored);
    return stored;
  }

  discoverKnowledge(): readonly KnowledgeNode[] {
    const discovered = this.discoveryEngine.discover();
    for (const node of discovered) {
      if (!this.nodeRegistry.getNode(node.id)) {
        this.registerNode(node);
      }
    }

    const bundle = this.documentation.generateDocumentation();
    for (const edge of bundle.dependencyGraph.edges) {
      this.registerDiscoveredRelation(
        this.resolveNodeId(edge.from),
        this.resolveNodeId(edge.to),
        this.mapArchitectureRelationKind(edge.kind),
      );
    }

    for (const capability of this.capabilityPlatform.listCapabilities()) {
      const sourceId = this.resolveNodeId(`knowledge-capability-${capability.id}`, capability.id);
      for (const dependency of capability.dependencies) {
        this.registerDiscoveredRelation(
          sourceId,
          this.resolveNodeId(`knowledge-capability-${dependency}`, dependency),
          "depends-on",
        );
      }
    }

    return discovered;
  }

  queryKnowledge(query: KnowledgeQuery): KnowledgeResult {
    return this.queryEngine.execute(query);
  }

  generateGraph(): KnowledgeGraph {
    return this.graphEngine.generate();
  }

  private registerDiscoveredRelation(
    sourceId: string | undefined,
    targetId: string | undefined,
    kind: KnowledgeRelationKind,
  ): void {
    if (!sourceId || !targetId || sourceId === targetId) {
      return;
    }
    const exists = this.relationRegistry
      .list(kind)
      .some((relation) => relation.sourceId === sourceId && relation.targetId === targetId);
    if (exists) {
      return;
    }
    this.registerRelation(
      createKnowledgeRelation({
        id: `relation-${kind}-${sourceId}-${targetId}`,
        kind,
        sourceId,
        targetId,
        metadata: Object.freeze({ source: "discovery" }),
      }),
    );
  }

  private resolveNodeId(...candidates: string[]): string | undefined {
    for (const candidate of candidates) {
      const trimmed = candidate.trim();
      if (this.nodeRegistry.getNode(trimmed)) {
        return trimmed;
      }
      const prefixed = trimmed.startsWith("knowledge-")
        ? trimmed
        : `knowledge-platform-${trimmed}`;
      if (this.nodeRegistry.getNode(prefixed)) {
        return prefixed;
      }
      const modulePrefixed = `knowledge-module-${trimmed}`;
      if (this.nodeRegistry.getNode(modulePrefixed)) {
        return modulePrefixed;
      }
    }
    return undefined;
  }

  private mapArchitectureRelationKind(
    kind: "uses" | "implements" | "registers" | "publishes",
  ): KnowledgeRelationKind {
    switch (kind) {
      case "implements":
        return "implements";
      case "uses":
        return "uses";
      case "registers":
        return "owns";
      case "publishes":
        return "communicates-with";
      default:
        return "depends-on";
    }
  }
}
