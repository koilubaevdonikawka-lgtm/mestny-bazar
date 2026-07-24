import type { IPlatformMonitoringEngine } from "@server/platform/autonomous-governance/autonomous-governance/contracts";
import {
  createPlatformMonitoringSnapshot,
  type PlatformMonitoringSnapshot,
} from "@server/platform/autonomous-governance/autonomous-governance/models";
import { createGovernanceEvaluationCompletedEvent } from "@server/platform/autonomous-governance/autonomous-governance/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { ArchitectureIntelligencePlatform } from "@server/platform/architecture-intelligence/architecture-intelligence/architecture-intelligence-platform";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import type { KnowledgePlatform } from "@server/platform/knowledge/knowledge/knowledge-platform";
import type { CompliancePlatform } from "@server/platform/compliance/compliance/compliance-platform";
import type { DecisionPlatform } from "@server/platform/decision/decision/decision-platform";

/** Collects platform status metadata from integrated platforms. */
export class PlatformMonitoringEngine implements IPlatformMonitoringEngine {
  constructor(
    private readonly documentation: DocumentationPlatform,
    private readonly architectureIntelligence: ArchitectureIntelligencePlatform,
    private readonly capabilityPlatform: CapabilityPlatform,
    private readonly knowledgePlatform: KnowledgePlatform,
    private readonly compliancePlatform: CompliancePlatform,
    private readonly decisionPlatform: DecisionPlatform,
  ) {}

  collect(): PlatformMonitoringSnapshot {
    const bundle = this.documentation.generateDocumentation();
    const score = this.architectureIntelligence.calculateArchitectureScore();
    const capabilities = this.capabilityPlatform.listCapabilities();
    const graph = this.knowledgePlatform.generateGraph();
    const readiness = this.compliancePlatform.readinessScore();
    const decisions = this.decisionPlatform.listDecisions();

    const snapshot = createPlatformMonitoringSnapshot({
      platformStatus: `${bundle.summary.platformCount} platforms active`,
      architectureStatus: `score=${score.overallScore}, risks=${this.architectureIntelligence.detectRisks().length}`,
      capabilityStatus: `${capabilities.length} capabilities registered`,
      knowledgeStatus: `${graph.nodeCount} nodes, ${graph.relationCount} relations`,
      complianceStatus: `readiness=${readiness}`,
      decisionStatus: `${decisions.length} decisions recorded`,
    });

    createGovernanceEvaluationCompletedEvent(snapshot);
    return snapshot;
  }
}
