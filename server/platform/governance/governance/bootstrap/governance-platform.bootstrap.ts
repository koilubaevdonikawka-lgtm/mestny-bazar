import { BootstrapTokens } from "@server/bootstrap/tokens";
import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { RuntimeTokens } from "@server/platform/runtime/runtime/tokens";
import { TestingTokens } from "@server/platform/testing/testing/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { IHealthService, IConfigurationProvider } from "@server/platform/runtime/runtime/contracts";
import { ProviderRegistry } from "@server/platform/integration/integration";
import type { ScenarioRunner } from "@server/platform/testing/testing/runners";
import type { AIWorkerRegistry } from "@server/platform/ai/ai/registry";
import {
  AIPolicyEvaluator,
  ArchitecturePolicyEvaluator,
  DependencyPolicyEvaluator,
  GovernancePlatform,
  GovernanceRegistry,
  GovernanceTokens,
  PolicyEngine,
  PolicyEnforcer,
  ProviderPolicyEvaluator,
  RuntimePolicyEvaluator,
  SecurityPolicyEvaluator,
  TestingPolicyEvaluator,
} from "@server/platform/governance/governance";

/** Registers governance platform services and evaluators. */
export function registerGovernancePlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(GovernanceTokens.GovernanceRegistry, () => new GovernanceRegistry());
  registry.registerSingleton(GovernanceTokens.PolicyEnforcer, () => new PolicyEnforcer());

  registry.registerSingleton(
    GovernanceTokens.DependencyPolicyEvaluator,
    (provider) =>
      new DependencyPolicyEvaluator(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
      ),
  );
  registry.registerSingleton(
    GovernanceTokens.ArchitecturePolicyEvaluator,
    (provider) =>
      new ArchitecturePolicyEvaluator(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
      ),
  );
  registry.registerSingleton(
    GovernanceTokens.ProviderPolicyEvaluator,
    (provider) =>
      new ProviderPolicyEvaluator(
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
      ),
  );
  registry.registerSingleton(
    GovernanceTokens.SecurityPolicyEvaluator,
    (provider) =>
      new SecurityPolicyEvaluator(
        provider.resolve<IConfigurationProvider>(RuntimeTokens.ConfigurationService),
      ),
  );
  registry.registerSingleton(
    GovernanceTokens.RuntimePolicyEvaluator,
    (provider) =>
      new RuntimePolicyEvaluator(provider.resolve<IHealthService>(RuntimeTokens.HealthService)),
  );
  registry.registerSingleton(
    GovernanceTokens.TestingPolicyEvaluator,
    (provider) =>
      new TestingPolicyEvaluator(provider.resolve<ScenarioRunner>(TestingTokens.ScenarioRunner)),
  );
  registry.registerSingleton(
    GovernanceTokens.AIPolicyEvaluator,
    (provider) =>
      new AIPolicyEvaluator(
        provider.resolve<AIWorkerRegistry>(BootstrapTokens.AIWorkerRegistry),
      ),
  );

  registry.registerSingleton(GovernanceTokens.PolicyEngine, (provider) => {
    const engine = new PolicyEngine(
      provider.resolve(GovernanceTokens.GovernanceRegistry),
      provider.resolve(GovernanceTokens.PolicyEnforcer),
      [
        provider.resolve(GovernanceTokens.DependencyPolicyEvaluator),
        provider.resolve(GovernanceTokens.ArchitecturePolicyEvaluator),
        provider.resolve(GovernanceTokens.ProviderPolicyEvaluator),
        provider.resolve(GovernanceTokens.SecurityPolicyEvaluator),
        provider.resolve(GovernanceTokens.RuntimePolicyEvaluator),
        provider.resolve(GovernanceTokens.TestingPolicyEvaluator),
        provider.resolve(GovernanceTokens.AIPolicyEvaluator),
      ],
    );
    return engine;
  });

  registry.registerSingleton(GovernanceTokens.GovernancePlatform, (provider) =>
    new GovernancePlatform(provider.resolve(GovernanceTokens.PolicyEngine)),
  );
}
