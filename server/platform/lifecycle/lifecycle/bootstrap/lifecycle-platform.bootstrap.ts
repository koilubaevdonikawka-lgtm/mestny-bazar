import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { GovernanceTokens } from "@server/platform/governance/governance/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { ObservabilityTokens } from "@server/platform/observability/observability/tokens";
import { OperationsTokens } from "@server/platform/operations/operations/tokens";
import { RuntimeTokens } from "@server/platform/runtime/runtime/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { ObservabilityPlatform } from "@server/platform/observability/observability/observability-platform";
import type { OperationsPlatform } from "@server/platform/operations/operations/operations-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type {
  IConfigurationProvider,
  IHealthService,
} from "@server/platform/runtime/runtime/contracts";
import {
  LifecycleManager,
  LifecycleOrchestrator,
  LifecyclePlatform,
  LifecycleRegistry,
  LifecycleStateEngine,
  LifecycleTokens,
  LifecycleTransitionEngine,
  LifecycleValidator,
  RecoveryPlanner,
} from "@server/platform/lifecycle/lifecycle";

/** Registers lifecycle platform services in the DI container. */
export function registerLifecyclePlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(LifecycleTokens.LifecycleRegistry, () => new LifecycleRegistry());
  registry.registerSingleton(LifecycleTokens.LifecycleStateEngine, () => new LifecycleStateEngine());
  registry.registerSingleton(LifecycleTokens.LifecycleTransitionEngine, () => new LifecycleTransitionEngine());
  registry.registerSingleton(LifecycleTokens.LifecycleOrchestrator, () => new LifecycleOrchestrator());
  registry.registerSingleton(LifecycleTokens.RecoveryPlanner, () => new RecoveryPlanner());

  registry.registerSingleton(
    LifecycleTokens.LifecycleValidator,
    (provider) =>
      new LifecycleValidator(
        provider.resolve<IConfigurationProvider>(RuntimeTokens.ConfigurationService),
        provider.resolve<IHealthService>(RuntimeTokens.HealthService),
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<GovernancePlatform>(GovernanceTokens.GovernancePlatform),
        provider.resolve<OperationsPlatform>(OperationsTokens.OperationsPlatform),
        provider.resolve<ObservabilityPlatform>(ObservabilityTokens.ObservabilityPlatform),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
      ),
  );

  registry.registerSingleton(
    LifecycleTokens.LifecycleManager,
    (provider) =>
      new LifecycleManager(
        provider.resolve(LifecycleTokens.LifecycleRegistry),
        provider.resolve(LifecycleTokens.LifecycleStateEngine),
        provider.resolve(LifecycleTokens.LifecycleTransitionEngine),
        provider.resolve(LifecycleTokens.LifecycleOrchestrator),
        provider.resolve(LifecycleTokens.LifecycleValidator),
        provider.resolve(LifecycleTokens.RecoveryPlanner),
      ),
  );

  registry.registerSingleton(LifecycleTokens.LifecyclePlatform, (provider) =>
    new LifecyclePlatform(provider.resolve(LifecycleTokens.LifecycleManager)),
  );
}
