import type { IArchitectureForecastEngine } from "@server/platform/architecture-intelligence/architecture-intelligence/contracts";
import {
  createArchitectureForecast,
  type ArchitectureForecast,
  type ForecastKind,
} from "@server/platform/architecture-intelligence/architecture-intelligence/models";
import { createArchitectureForecastGeneratedEvent } from "@server/platform/architecture-intelligence/architecture-intelligence/events";
import type { DigitalTwinPlatform } from "@server/platform/digital-twin/digital-twin/digital-twin-platform";
import type { KnowledgePlatform } from "@server/platform/knowledge/knowledge/knowledge-platform";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";

/** Forecasts architecture evolution from metadata (no side effects). */
export class ArchitectureForecastEngine implements IArchitectureForecastEngine {
  constructor(
    private readonly documentation: DocumentationPlatform,
    private readonly knowledgePlatform: KnowledgePlatform,
    private readonly capabilityPlatform: CapabilityPlatform,
    private readonly digitalTwinPlatform: DigitalTwinPlatform,
  ) {}

  forecast(kind: ForecastKind = "growth"): ArchitectureForecast {
    const bundle = this.documentation.generateDocumentation();
    const graph = this.knowledgePlatform.generateGraph();
    const capabilities = this.capabilityPlatform.listCapabilities();
    const snapshot = this.digitalTwinPlatform.createSnapshot("platform");

    const projections = this.buildProjections(kind, bundle, graph, capabilities, snapshot.id);
    const forecast = createArchitectureForecast({
      kind,
      projections,
      confidence: 0.8,
      metadata: Object.freeze({ baseSnapshotId: snapshot.id }),
    });
    createArchitectureForecastGeneratedEvent(forecast);
    return forecast;
  }

  private buildProjections(
    kind: ForecastKind,
    bundle: ReturnType<DocumentationPlatform["generateDocumentation"]>,
    graph: ReturnType<KnowledgePlatform["generateGraph"]>,
    capabilities: ReturnType<CapabilityPlatform["listCapabilities"]>,
    snapshotId: string,
  ): readonly string[] {
    switch (kind) {
      case "growth":
        return Object.freeze([
          `Projected platform growth from ${bundle.summary.platformCount} platforms`,
          `Module base: ${bundle.summary.moduleCount}`,
          `Snapshot: ${snapshotId}`,
        ]);
      case "dependency":
        return Object.freeze([
          `Current dependencies: ${bundle.summary.dependencyCount}`,
          `Projected relations: ${graph.relationCount + 5}`,
        ]);
      case "complexity":
        return Object.freeze([
          `Complexity index baseline: ${bundle.summary.dependencyCount}`,
          `Knowledge nodes: ${graph.nodeCount}`,
        ]);
      case "capability":
        return Object.freeze([
          `Capability count: ${capabilities.length}`,
          ...capabilities.slice(0, 3).map((capability) => `Growth path: ${capability.name}`),
        ]);
      default:
        return Object.freeze([]);
    }
  }
}
