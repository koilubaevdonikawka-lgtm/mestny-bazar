import type { IPolicyEvaluator } from "@server/platform/governance/governance/contracts";
import type { PolicyDescriptor, PolicyResult } from "@server/platform/governance/governance/models";
import {
  createPolicyResult,
  createPolicyViolation,
  PolicySeverity,
} from "@server/platform/governance/governance/models";
import { ProviderRegistry } from "@server/platform/integration/integration";

/** Evaluates provider governance policies using ProviderRegistry metadata. */
export class ProviderPolicyEvaluator implements IPolicyEvaluator {
  readonly id = "provider-policy-evaluator";
  readonly supportedCategories = ["provider", "deployment"];

  constructor(private readonly providerRegistry: ProviderRegistry) {}

  evaluate(descriptor: PolicyDescriptor): PolicyResult {
    const providers = this.providerRegistry.list();
    const violations = [];

    const requiredCapabilities = ["payment", "notification", "storage", "ai"];
    for (const capability of requiredCapabilities) {
      const registered = providers.some(
        (provider) => provider.capability === capability && provider.enabled,
      );
      if (!registered) {
        violations.push(
          createPolicyViolation({
            policyId: descriptor.id,
            code: "PROVIDER_NOT_REGISTERED",
            message: `Required provider capability "${capability}" is not registered or enabled.`,
            severity: PolicySeverity.Warning,
          }),
        );
      }
    }

    return createPolicyResult({
      policyId: descriptor.id,
      passed: violations.length === 0,
      violations,
    });
  }
}
