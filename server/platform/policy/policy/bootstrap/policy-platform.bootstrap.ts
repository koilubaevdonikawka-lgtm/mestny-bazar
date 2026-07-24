import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { FeatureTokens } from "@server/platform/features/features/tokens";
import { GatewayTokens } from "@server/platform/gateway/gateway/tokens";
import { GovernanceTokens } from "@server/platform/governance/governance/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { RuntimeTokens } from "@server/platform/runtime/runtime/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { FeaturePlatform } from "@server/platform/features/features/feature-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { GatewayPlatform } from "@server/platform/gateway/gateway/gateway-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type {
  IConfigurationProvider,
  IHealthService,
} from "@server/platform/runtime/runtime/contracts";
import {
  PolicyEnforcementEngine,
  PolicyEvaluator,
  PolicyExceptionRegistry,
  PolicyManager,
  PolicyPlatform,
  PolicyRegistry,
  PolicyTokens,
  RuleRegistry,
  ScopeResolver,
} from "@server/platform/policy/policy";

/** Registers policy platform services in the DI container. */
export function registerPolicyPlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(PolicyTokens.PolicyRegistry, () => new PolicyRegistry());
  registry.registerSingleton(PolicyTokens.RuleRegistry, () => new RuleRegistry());
  registry.registerSingleton(PolicyTokens.PolicyExceptionRegistry, () => new PolicyExceptionRegistry());
  registry.registerSingleton(PolicyTokens.PolicyEnforcementEngine, () => new PolicyEnforcementEngine());

  registry.registerSingleton(
    PolicyTokens.ScopeResolver,
    (provider) =>
      new ScopeResolver(
        provider.resolve<IConfigurationProvider>(RuntimeTokens.ConfigurationService),
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<GatewayPlatform>(GatewayTokens.GatewayPlatform),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
      ),
  );

  registry.registerSingleton(
    PolicyTokens.PolicyEvaluator,
    (provider) =>
      new PolicyEvaluator(
        provider.resolve<IConfigurationProvider>(RuntimeTokens.ConfigurationService),
        provider.resolve<IHealthService>(RuntimeTokens.HealthService),
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<GovernancePlatform>(GovernanceTokens.GovernancePlatform),
        provider.resolve<GatewayPlatform>(GatewayTokens.GatewayPlatform),
        provider.resolve<FeaturePlatform>(FeatureTokens.FeaturePlatform),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
        provider.resolve(PolicyTokens.PolicyExceptionRegistry),
      ),
  );

  registry.registerSingleton(
    PolicyTokens.PolicyManager,
    (provider) =>
      new PolicyManager(
        provider.resolve(PolicyTokens.PolicyRegistry),
        provider.resolve(PolicyTokens.PolicyEvaluator),
        provider.resolve(PolicyTokens.PolicyEnforcementEngine),
      ),
  );

  registry.registerSingleton(PolicyTokens.PolicyPlatform, (provider) =>
    new PolicyPlatform(provider.resolve(PolicyTokens.PolicyManager)),
  );
}
