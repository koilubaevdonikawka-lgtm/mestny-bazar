import type { IArchitectureRiskEngine } from "@server/platform/architecture-intelligence/architecture-intelligence/contracts";
import {
  createArchitectureRisk,
  type ArchitectureRisk,
  type ArchitectureRiskSeverity,
} from "@server/platform/architecture-intelligence/architecture-intelligence/models";
import { createArchitectureRiskDetectedEvent } from "@server/platform/architecture-intelligence/architecture-intelligence/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { KnowledgePlatform } from "@server/platform/knowledge/knowledge/knowledge-platform";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import type { CompliancePlatform } from "@server/platform/compliance/compliance/compliance-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";

/** Detects architecture risks from platform metadata. */
export class ArchitectureRiskEngine implements IArchitectureRiskEngine {
  constructor(
    private readonly documentation: DocumentationPlatform,
    private readonly knowledgePlatform: KnowledgePlatform,
    private readonly capabilityPlatform: CapabilityPlatform,
    private readonly compliancePlatform: CompliancePlatform,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  detect(): readonly ArchitectureRisk[] {
    const bundle = this.documentation.generateDocumentation();
    const graph = this.knowledgePlatform.generateGraph();
    const capabilities = this.capabilityPlatform.listCapabilities();
    const providers = this.providerRegistry.list();
    const readiness = this.compliancePlatform.readinessScore();

    const risks: ArchitectureRisk[] = [];

    if (bundle.summary.dependencyCount > 50) {
      risks.push(
        createArchitectureRisk({
          kind: "dependency",
          severity: this.severityFromCount(bundle.summary.dependencyCount, 50, 100),
          title: "High dependency density",
          description: `${bundle.summary.dependencyCount} dependency edges detected`,
        }),
      );
    }

    if (graph.relationCount > graph.nodeCount * 2) {
      risks.push(
        createArchitectureRisk({
          kind: "architecture",
          severity: "medium",
          title: "Elevated coupling in knowledge graph",
          description: "Relation-to-node ratio exceeds recommended threshold",
        }),
      );
    }

    for (const capability of capabilities.filter((entry) => entry.dependencies.length > 3)) {
      risks.push(
        createArchitectureRisk({
          kind: "complexity",
          severity: "medium",
          title: `Complex capability: ${capability.name}`,
          description: `${capability.dependencies.length} dependencies`,
          sourceId: capability.id,
        }),
      );
    }

    if (providers.length === 0) {
      risks.push(
        createArchitectureRisk({
          kind: "provider",
          severity: "low",
          title: "No registered providers",
          description: "Provider registry is empty",
        }),
      );
    }

    if (readiness < 70) {
      risks.push(
        createArchitectureRisk({
          kind: "architecture",
          severity: readiness < 50 ? "high" : "medium",
          title: "Compliance readiness below target",
          description: `Readiness score: ${readiness}`,
        }),
      );
    }

    for (const capability of capabilities) {
      if (capability.version !== "1.0.0") {
        risks.push(
          createArchitectureRisk({
            kind: "version",
            severity: "low",
            title: `Non-default version: ${capability.name}`,
            description: `Version ${capability.version}`,
            sourceId: capability.id,
          }),
        );
      }
    }

    createArchitectureRiskDetectedEvent(risks);
    return Object.freeze([...risks]);
  }

  private severityFromCount(
    count: number,
    mediumThreshold: number,
    highThreshold: number,
  ): ArchitectureRiskSeverity {
    if (count >= highThreshold) {
      return "critical";
    }
    if (count >= mediumThreshold) {
      return "high";
    }
    return "medium";
  }
}
