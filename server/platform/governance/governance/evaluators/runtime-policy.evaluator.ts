import type { IPolicyEvaluator } from "@server/platform/governance/governance/contracts";
import type { PolicyDescriptor, PolicyResult } from "@server/platform/governance/governance/models";
import {
  createPolicyResult,
  createPolicyViolation,
  PolicySeverity,
} from "@server/platform/governance/governance/models";
import type { IHealthService } from "@server/platform/runtime/runtime/contracts";

/** Evaluates runtime governance policies using health platform metadata. */
export class RuntimePolicyEvaluator implements IPolicyEvaluator {
  readonly id = "runtime-policy-evaluator";
  readonly supportedCategories = ["platform", "deployment"];

  constructor(private readonly healthService: IHealthService) {}

  async evaluate(descriptor: PolicyDescriptor): Promise<PolicyResult> {
    const health = await this.healthService.check();
    const violations = health.components
      .filter((component) => component.status === "unhealthy")
      .map((component) =>
        createPolicyViolation({
          policyId: descriptor.id,
          code: "RUNTIME_UNHEALTHY",
          message: component.message ?? `Component ${component.name} is unhealthy`,
          severity: PolicySeverity.Error,
          source: component.name,
        }),
      );

    if (health.status === "degraded") {
      violations.push(
        createPolicyViolation({
          policyId: descriptor.id,
          code: "RUNTIME_DEGRADED",
          message: "Platform health is degraded.",
          severity: PolicySeverity.Warning,
        }),
      );
    }

    return createPolicyResult({
      policyId: descriptor.id,
      passed: health.status === "healthy",
      violations,
    });
  }
}
