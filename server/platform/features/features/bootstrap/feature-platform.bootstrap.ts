import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { GatewayTokens } from "@server/platform/gateway/gateway/tokens";
import { GovernanceTokens } from "@server/platform/governance/governance/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { RuntimeTokens } from "@server/platform/runtime/runtime/tokens";
import { SDKTokens } from "@server/platform/sdk/sdk/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { GatewayPlatform } from "@server/platform/gateway/gateway/gateway-platform";
import type { ISDKRegistry } from "@server/platform/sdk/sdk/contracts";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { IConfigurationProvider } from "@server/platform/runtime/runtime/contracts";
import {
  ExperimentRegistry,
  FeatureFlagEngine,
  FeatureManager,
  FeaturePlatform,
  FeatureRegistry,
  FeatureTokens,
  RolloutManager,
  TargetingEngine,
} from "@server/platform/features/features";

/** Registers feature platform services in the DI container. */
export function registerFeaturePlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(FeatureTokens.FeatureRegistry, () => new FeatureRegistry());
  registry.registerSingleton(FeatureTokens.ExperimentRegistry, () => new ExperimentRegistry());
  registry.registerSingleton(FeatureTokens.RolloutManager, () => new RolloutManager());

  registry.registerSingleton(
    FeatureTokens.TargetingEngine,
    (provider) =>
      new TargetingEngine(
        provider.resolve<IConfigurationProvider>(RuntimeTokens.ConfigurationService),
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<GovernancePlatform>(GovernanceTokens.GovernancePlatform),
        provider.resolve<GatewayPlatform>(GatewayTokens.GatewayPlatform),
        provider.resolve<ISDKRegistry>(SDKTokens.SDKRegistry),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
      ),
  );

  registry.registerSingleton(
    FeatureTokens.FeatureFlagEngine,
    (provider) =>
      new FeatureFlagEngine(provider.resolve(FeatureTokens.TargetingEngine)),
  );

  registry.registerSingleton(
    FeatureTokens.FeatureManager,
    (provider) =>
      new FeatureManager(
        provider.resolve(FeatureTokens.FeatureRegistry),
        provider.resolve(FeatureTokens.FeatureFlagEngine),
        provider.resolve(FeatureTokens.TargetingEngine),
      ),
  );

  registry.registerSingleton(FeatureTokens.FeaturePlatform, (provider) =>
    new FeaturePlatform(
      provider.resolve(FeatureTokens.FeatureManager),
      provider.resolve(FeatureTokens.RolloutManager),
    ),
  );
}
