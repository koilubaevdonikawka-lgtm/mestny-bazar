import type { IPolicyEvaluator } from "@server/platform/governance/governance/contracts";
import type { PolicyDescriptor, PolicyResult } from "@server/platform/governance/governance/models";
import {
  createPolicyResult,
  createPolicyViolation,
  PolicySeverity,
} from "@server/platform/governance/governance/models";
import type { IConfigurationProvider } from "@server/platform/runtime/runtime/contracts";

/** Evaluates security governance policies using runtime configuration metadata. */
export class SecurityPolicyEvaluator implements IPolicyEvaluator {
  readonly id = "security-policy-evaluator";
  readonly supportedCategories = ["security"];

  constructor(private readonly configurationService: IConfigurationProvider) {}

  evaluate(descriptor: PolicyDescriptor): PolicyResult {
    const snapshot = this.configurationService.snapshot();
    const violations = [];

    if (!snapshot.values.defaultCurrency) {
      violations.push(
        createPolicyViolation({
          policyId: descriptor.id,
          code: "SECURITY_CONFIG_MISSING",
          message: "Default currency must be configured.",
          severity: PolicySeverity.Error,
        }),
      );
    }

    if (snapshot.source !== "composition-root" && snapshot.source !== "environment") {
      violations.push(
        createPolicyViolation({
          policyId: descriptor.id,
          code: "SECURITY_CONFIG_SOURCE",
          message: `Unexpected configuration source: ${snapshot.source}`,
          severity: PolicySeverity.Warning,
        }),
      );
    }

    return createPolicyResult({
      policyId: descriptor.id,
      passed: violations.length === 0,
      violations,
    });
  }
}
