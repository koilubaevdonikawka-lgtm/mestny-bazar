import type { IArchitectureAnalyzer } from "@server/platform/developer/developer/contracts";
import {
  createAnalysisReport,
  type AnalysisReport,
  type AnalysisSection,
} from "@server/platform/developer/developer/models";
import { createAnalysisCompletedEvent } from "@server/platform/developer/developer/events";
import { listRegisteredDiTokens } from "@server/platform/developer/developer/catalog/di-token.catalog";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import { ArchitectureNodeKind } from "@server/platform/documentation/documentation/models";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";

/** Analyzes architecture metadata from documentation and DI registrations. */
export class ArchitectureAnalyzer implements IArchitectureAnalyzer {
  constructor(
    private readonly documentation: DocumentationPlatform,
    private readonly serviceRegistry: ServiceRegistry,
  ) {}

  analyze(): AnalysisReport {
    const bundle = this.documentation.generateDocumentation();
    const nodes = bundle.dependencyGraph.nodes;
    const bcm = nodes
      .filter((node) => node.kind === ArchitectureNodeKind.BusinessCapabilityModule)
      .map((node) => node.id);
    const bpm = nodes
      .filter((node) => node.kind === ArchitectureNodeKind.BusinessProcessModule)
      .map((node) => node.id);
    const platforms = bundle.platformCatalog.platforms.map((platform) => platform.id);
    const infrastructure = nodes
      .filter((node) => node.kind === ArchitectureNodeKind.InfrastructureAdapter)
      .map((node) => node.id);
    const dependencyEdges = bundle.dependencyGraph.edges.map(
      (edge) => `${edge.from} -> ${edge.to} (${edge.kind})`,
    );
    const diRegistrations = listRegisteredDiTokens(this.serviceRegistry);

    const sections: AnalysisSection[] = [
      {
        name: "Summary",
        count: bundle.summary.moduleCount + bundle.summary.platformCount,
        items: Object.freeze([
          `modules=${bundle.summary.moduleCount}`,
          `platforms=${bundle.summary.platformCount}`,
          `providers=${bundle.summary.providerCount}`,
          `dependencies=${bundle.summary.dependencyCount}`,
        ]),
      },
      {
        name: "Public API",
        count: bundle.publicApiCatalog.entries.length,
        items: bundle.publicApiCatalog.entries.map(
          (entry) => `${entry.moduleId}: ${entry.methods.join(", ")}`,
        ),
      },
    ];

    const report = createAnalysisReport({
      businessCapabilityModules: bcm,
      businessProcessModules: bpm,
      platformModules: platforms,
      infrastructureAdapters: infrastructure,
      dependencyEdges,
      diRegistrations,
      sections,
    });

    createAnalysisCompletedEvent(report);
    return report;
  }
}
