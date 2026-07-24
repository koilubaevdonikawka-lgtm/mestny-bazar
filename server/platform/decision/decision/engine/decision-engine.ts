import type { IDecisionEngine } from "@server/platform/decision/decision/contracts";
import {
  createDecisionEvidence,
  type DecisionDescriptor,
  type DecisionEvidence,
} from "@server/platform/decision/decision/models";
import type { ArchitectureIntelligencePlatform } from "@server/platform/architecture-intelligence/architecture-intelligence/architecture-intelligence-platform";
import type { KnowledgePlatform } from "@server/platform/knowledge/knowledge/knowledge-platform";
import type { PolicyPlatform } from "@server/platform/policy/policy/policy-platform";
import type { CompliancePlatform } from "@server/platform/compliance/compliance/compliance-platform";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";

/** Collects decision evidence from platform metadata. */
export class DecisionEngine implements IDecisionEngine {
  constructor(
    private readonly architectureIntelligence: ArchitectureIntelligencePlatform,
    private readonly knowledgePlatform: KnowledgePlatform,
    private readonly policyPlatform: PolicyPlatform,
    private readonly compliancePlatform: CompliancePlatform,
    private readonly capabilityPlatform: CapabilityPlatform,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  collectEvidence(descriptor: DecisionDescriptor): readonly DecisionEvidence[] {
    const analysis = this.architectureIntelligence.analyzeArchitecture();
    const risks = this.architectureIntelligence.detectRisks();
    const score = this.architectureIntelligence.calculateArchitectureScore();
    const graph = this.knowledgePlatform.generateGraph();
    const policies = this.policyPlatform.listPolicies();
    const readiness = this.compliancePlatform.readinessScore();
    const capabilities = this.capabilityPlatform.listCapabilities();
    const providers = this.providerRegistry.list();

    const evidence: DecisionEvidence[] = [
      createDecisionEvidence({
        source: "architecture-intelligence",
        label: "architecture-score",
        value: String(score.overallScore),
        weight: 3,
      }),
      createDecisionEvidence({
        source: "architecture-intelligence",
        label: "risk-count",
        value: String(risks.length),
        weight: 2,
      }),
      createDecisionEvidence({
        source: "knowledge-platform",
        label: "graph-relations",
        value: String(graph.relationCount),
        weight: 2,
      }),
      createDecisionEvidence({
        source: "policy-platform",
        label: "policy-count",
        value: String(policies.length),
        weight: 2,
      }),
      createDecisionEvidence({
        source: "compliance-platform",
        label: "readiness-score",
        value: String(readiness),
        weight: 3,
      }),
      createDecisionEvidence({
        source: "capability-platform",
        label: "capability-count",
        value: String(capabilities.length),
        weight: 1,
      }),
      createDecisionEvidence({
        source: "provider-registry",
        label: "provider-count",
        value: String(providers.length),
        weight: 1,
      }),
      createDecisionEvidence({
        source: "architecture-intelligence",
        label: "dependency-count",
        value: String(analysis.metrics.dependencyCount ?? 0),
        weight: 2,
      }),
    ];

    return Object.freeze([...evidence]);
  }
}
