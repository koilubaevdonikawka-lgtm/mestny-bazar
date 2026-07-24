import type { IArchitectureAnalyzer } from "@server/platform/architecture-intelligence/architecture-intelligence/contracts";
import {
  createArchitectureAnalysis,
  type ArchitectureAnalysis,
} from "@server/platform/architecture-intelligence/architecture-intelligence/models";
import { createArchitectureAnalyzedEvent } from "@server/platform/architecture-intelligence/architecture-intelligence/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { KnowledgePlatform } from "@server/platform/knowledge/knowledge/knowledge-platform";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import type { DigitalTwinPlatform } from "@server/platform/digital-twin/digital-twin/digital-twin-platform";

/** Metadata analyzer for platform architecture dimensions. */
export class ArchitectureAnalyzer implements IArchitectureAnalyzer {
  constructor(
    private readonly documentation: DocumentationPlatform,
    private readonly knowledgePlatform: KnowledgePlatform,
    private readonly capabilityPlatform: CapabilityPlatform,
    private readonly digitalTwinPlatform: DigitalTwinPlatform,
  ) {}

  analyze(): ArchitectureAnalysis {
    const bundle = this.documentation.generateDocumentation();
    const graph = this.knowledgePlatform.generateGraph();
    const catalog = this.capabilityPlatform.generateCatalog();
    const snapshots = this.digitalTwinPlatform.synchronize();

    const platformNodes = bundle.dependencyGraph.nodes.filter((node) => node.layer === "platform");
    const moduleNodes = bundle.dependencyGraph.nodes.filter(
      (node) => node.layer !== "platform" && node.layer !== "domain",
    );

    const analysis = createArchitectureAnalysis({
      dimensions: Object.freeze([
        "dependencies",
        "layering",
        "coupling",
        "modularity",
        "platform-boundaries",
        "capability-relations",
      ]),
      findings: Object.freeze([
        `Platform nodes: ${platformNodes.length}`,
        `Module nodes: ${moduleNodes.length}`,
        `Knowledge relations: ${graph.relationCount}`,
        `Capability entries: ${catalog.entries.length}`,
        `Digital twin snapshots: ${snapshots.length}`,
      ]),
      metrics: Object.freeze({
        dependencyCount: bundle.summary.dependencyCount,
        platformCount: bundle.summary.platformCount,
        moduleCount: bundle.summary.moduleCount,
        knowledgeNodeCount: graph.nodeCount,
        capabilityCount: catalog.entries.length,
        twinSnapshotCount: snapshots.length,
        couplingIndex: Math.min(100, bundle.summary.dependencyCount * 2),
        modularityIndex: Math.max(0, 100 - bundle.summary.dependencyCount),
      }),
      metadata: Object.freeze({ readOnly: true }),
    });

    createArchitectureAnalyzedEvent(analysis);
    return analysis;
  }
}
