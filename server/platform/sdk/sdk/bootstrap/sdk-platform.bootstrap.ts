import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { EvolutionTokens } from "@server/platform/evolution/evolution/tokens";
import { GovernanceTokens } from "@server/platform/governance/governance/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { ReleaseTokens } from "@server/platform/release/release/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { EvolutionPlatform } from "@server/platform/evolution/evolution/evolution-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { ReleasePlatform } from "@server/platform/release/release/release-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import {
  SDKCompatibilityEngine,
  SDKGenerator,
  SDKManager,
  SDKPlatform,
  SDKRegistry,
  SDKTokens,
  SerializationEngine,
} from "@server/platform/sdk/sdk";

/** Registers SDK platform services in the DI container. */
export function registerSDKPlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(SDKTokens.SDKRegistry, () => new SDKRegistry());
  registry.registerSingleton(SDKTokens.SerializationEngine, () => new SerializationEngine());

  registry.registerSingleton(
    SDKTokens.SDKCompatibilityEngine,
    (provider) =>
      new SDKCompatibilityEngine(
        provider.resolve(SDKTokens.SDKRegistry),
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<EvolutionPlatform>(EvolutionTokens.EvolutionPlatform),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
        registry,
      ),
  );

  registry.registerSingleton(
    SDKTokens.SDKGenerator,
    (provider) =>
      new SDKGenerator(
        provider.resolve(SDKTokens.SDKRegistry),
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<GovernancePlatform>(GovernanceTokens.GovernancePlatform),
        provider.resolve<ReleasePlatform>(ReleaseTokens.ReleasePlatform),
      ),
  );

  registry.registerSingleton(
    SDKTokens.SDKManager,
    (provider) =>
      new SDKManager(
        provider.resolve(SDKTokens.SDKRegistry),
        provider.resolve(SDKTokens.SDKGenerator),
        provider.resolve(SDKTokens.SDKCompatibilityEngine),
        provider.resolve(SDKTokens.SerializationEngine),
      ),
  );

  registry.registerSingleton(SDKTokens.SDKPlatform, (provider) =>
    new SDKPlatform(provider.resolve(SDKTokens.SDKManager)),
  );
}
