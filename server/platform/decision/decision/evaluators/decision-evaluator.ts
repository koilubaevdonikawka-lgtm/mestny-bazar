import type { IDecisionEvaluator } from "@server/platform/decision/decision/contracts";
import type { EvaluationKind } from "@server/platform/decision/decision/contracts";
import type {
  DecisionDescriptor,
  DecisionEvidence,
} from "@server/platform/decision/decision/models";
import type { PolicyPlatform } from "@server/platform/policy/policy/policy-platform";
import type { ArchitectureIntelligencePlatform } from "@server/platform/architecture-intelligence/architecture-intelligence/architecture-intelligence-platform";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";

/** Evaluates decisions against rules, policies, risks and compatibility (metadata only). */
export class DecisionEvaluator implements IDecisionEvaluator {
  constructor(
    private readonly policyPlatform: PolicyPlatform,
    private readonly architectureIntelligence: ArchitectureIntelligencePlatform,
    private readonly capabilityPlatform: CapabilityPlatform,
  ) {}

  evaluate(
    descriptor: DecisionDescriptor,
    evidence: readonly DecisionEvidence[],
    kind: EvaluationKind = "rule",
  ): boolean {
    switch (kind) {
      case "policy":
        return this.evaluatePolicy(descriptor);
      case "risk":
        return this.evaluateRisk();
      case "compatibility":
        return this.evaluateCompatibility(descriptor);
      case "rule":
      default:
        return this.evaluateRules(evidence);
    }
  }

  evaluateAll(descriptor: DecisionDescriptor, evidence: readonly DecisionEvidence[]): boolean {
    return (
      this.evaluate(descriptor, evidence, "rule") &&
      this.evaluate(descriptor, evidence, "policy") &&
      this.evaluate(descriptor, evidence, "risk") &&
      this.evaluate(descriptor, evidence, "compatibility")
    );
  }

  private evaluateRules(evidence: readonly DecisionEvidence[]): boolean {
    const weighted = evidence.reduce((sum, item) => sum + item.weight, 0);
    return weighted >= 5;
  }

  private evaluatePolicy(descriptor: DecisionDescriptor): boolean {
    const policies = this.policyPlatform.listPolicies();
    if (policies.length === 0) {
      return true;
    }
    const report = this.policyPlatform.generatePolicyReport();
    return report.failed === 0 || descriptor.strategy === "experimental";
  }

  private evaluateRisk(): boolean {
    const risks = this.architectureIntelligence.detectRisks();
    const critical = risks.filter((risk) => risk.severity === "critical").length;
    return critical === 0;
  }

  private evaluateCompatibility(descriptor: DecisionDescriptor): boolean {
    if (descriptor.kind !== "platform" && descriptor.kind !== "architecture") {
      return true;
    }
    const capabilities = this.capabilityPlatform.listCapabilities();
    return capabilities.every((capability) => capability.dependencies.length <= 5);
  }
}
