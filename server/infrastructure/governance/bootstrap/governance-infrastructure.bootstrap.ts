import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  GovernanceTokens,
  registerDefaultGovernancePolicies,
  type GovernanceRegistry,
  type PolicyEngine,
} from "@server/platform/governance/governance";

/** Activates default governance policies in the policy engine. */
export function activateGovernancePolicies(provider: ServiceProvider): void {
  const registry = provider.resolve<GovernanceRegistry>(GovernanceTokens.GovernanceRegistry);
  const engine = provider.resolve<PolicyEngine>(GovernanceTokens.PolicyEngine);

  registerDefaultGovernancePolicies(registry);

  for (const descriptor of registry.listPolicies()) {
    engine.registerEvaluatorPolicy(descriptor);
  }
}
