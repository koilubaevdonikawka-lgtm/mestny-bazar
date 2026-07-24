import {
  createPolicyDescriptor,
  PolicyCategory,
  PolicySeverity,
} from "@server/platform/governance/governance/models";
import type { IGovernanceRegistry } from "@server/platform/governance/governance/contracts";

/** Registers default governance policies across all categories. */
export function registerDefaultGovernancePolicies(registry: IGovernanceRegistry): void {
  const policies = [
    createPolicyDescriptor({
      id: "business-module-api-only",
      name: "Business Module API Boundary",
      category: PolicyCategory.Business,
      description: "Business modules must expose public APIs without direct service coupling.",
      severity: PolicySeverity.Error,
      evaluatorId: "architecture-policy-evaluator",
    }),
    createPolicyDescriptor({
      id: "platform-boundary",
      name: "Platform Boundary Policy",
      category: PolicyCategory.Platform,
      description: "Platform layers must not violate dependency boundaries.",
      severity: PolicySeverity.Error,
      evaluatorId: "dependency-policy-evaluator",
    }),
    createPolicyDescriptor({
      id: "security-configuration",
      name: "Security Configuration Policy",
      category: PolicyCategory.Security,
      description: "Runtime configuration must satisfy security baseline requirements.",
      severity: PolicySeverity.Error,
      evaluatorId: "security-policy-evaluator",
    }),
    createPolicyDescriptor({
      id: "deployment-health",
      name: "Deployment Health Policy",
      category: PolicyCategory.Deployment,
      description: "Platform must be healthy before deployment is considered compliant.",
      severity: PolicySeverity.Error,
      evaluatorId: "runtime-policy-evaluator",
    }),
    createPolicyDescriptor({
      id: "provider-registration",
      name: "Provider Registration Policy",
      category: PolicyCategory.Provider,
      description: "Required external provider capabilities must be registered.",
      severity: PolicySeverity.Warning,
      evaluatorId: "provider-policy-evaluator",
    }),
    createPolicyDescriptor({
      id: "ai-worker-coverage",
      name: "AI Worker Coverage Policy",
      category: PolicyCategory.AI,
      description: "Required AI workers must be registered in the AI platform.",
      severity: PolicySeverity.Warning,
      evaluatorId: "ai-policy-evaluator",
    }),
    createPolicyDescriptor({
      id: "testing-scenario-coverage",
      name: "Testing Scenario Coverage Policy",
      category: PolicyCategory.Testing,
      description: "Required end-to-end scenarios must be registered in the testing platform.",
      severity: PolicySeverity.Warning,
      evaluatorId: "testing-policy-evaluator",
    }),
    createPolicyDescriptor({
      id: "documentation-architecture",
      name: "Documentation Architecture Policy",
      category: PolicyCategory.Documentation,
      description: "Architecture documentation must pass validation without violations.",
      severity: PolicySeverity.Error,
      evaluatorId: "architecture-policy-evaluator",
    }),
  ];

  for (const policy of policies) {
    registry.registerPolicy(policy);
  }
}
