import type { IPolicyEvaluator } from "@server/platform/governance/governance/contracts";
import type { PolicyDescriptor, PolicyResult } from "@server/platform/governance/governance/models";
import {
  createPolicyResult,
  createPolicyViolation,
  PolicySeverity,
} from "@server/platform/governance/governance/models";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";

/** Evaluates dependency governance policies using documentation metadata. */
export class DependencyPolicyEvaluator implements IPolicyEvaluator {
  readonly id = "dependency-policy-evaluator";
  readonly supportedCategories = ["platform", "business"];

  constructor(private readonly documentationPlatform: DocumentationPlatform) {}

  evaluate(descriptor: PolicyDescriptor): PolicyResult {
    const validation = this.documentationPlatform.validateArchitecture();
    const violations = validation.violations
      .filter((violation) => violation.code.includes("DEPENDENCY") || violation.code.includes("CYCLIC"))
      .map((violation) =>
        createPolicyViolation({
          policyId: descriptor.id,
          code: violation.code,
          message: violation.message,
          severity: descriptor.severity,
          source: violation.sourceId,
        }),
      );

    return createPolicyResult({
      policyId: descriptor.id,
      passed: violations.length === 0,
      violations,
    });
  }
}
