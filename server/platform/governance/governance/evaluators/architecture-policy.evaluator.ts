import type { IPolicyEvaluator } from "@server/platform/governance/governance/contracts";
import type { PolicyDescriptor, PolicyResult } from "@server/platform/governance/governance/models";
import {
  createPolicyResult,
  createPolicyViolation,
} from "@server/platform/governance/governance/models";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";

/** Evaluates architecture governance policies using documentation validation. */
export class ArchitecturePolicyEvaluator implements IPolicyEvaluator {
  readonly id = "architecture-policy-evaluator";
  readonly supportedCategories = ["platform", "documentation", "business"];

  constructor(private readonly documentationPlatform: DocumentationPlatform) {}

  evaluate(descriptor: PolicyDescriptor): PolicyResult {
    const validation = this.documentationPlatform.validateArchitecture();
    const violations = validation.violations.map((violation) =>
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
      passed: validation.valid,
      violations,
    });
  }
}
