import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { GatewayTokens } from "@server/platform/gateway/gateway/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { LifecycleTokens } from "@server/platform/lifecycle/lifecycle/tokens";
import { RuntimeTokens } from "@server/platform/runtime/runtime/tokens";
import { SDKTokens } from "@server/platform/sdk/sdk/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GatewayPlatform } from "@server/platform/gateway/gateway/gateway-platform";
import type { IEndpointRegistry } from "@server/platform/gateway/gateway/contracts";
import type { ISDKRegistry } from "@server/platform/sdk/sdk/contracts";
import type { ILifecycleRegistry } from "@server/platform/lifecycle/lifecycle/contracts";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { IConfigurationProvider } from "@server/platform/runtime/runtime/contracts";
import {
  CapabilityAvailabilityEngine,
  CapabilityCatalogService,
  CapabilityCompatibilityEngine,
  CapabilityDependencyEngine,
  CapabilityDiscoveryEngine,
  CapabilityManager,
  CapabilityPlatform,
  CapabilityRegistry,
  CapabilityTokens,
} from "@server/platform/capabilities/capabilities";

/** Registers capability platform services in the DI container. */
export function registerCapabilityPlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(CapabilityTokens.CapabilityRegistry, () => new CapabilityRegistry());
  registry.registerSingleton(
    CapabilityTokens.CapabilityDependencyEngine,
    () => new CapabilityDependencyEngine(),
  );

  registry.registerSingleton(
    CapabilityTokens.CapabilityDiscoveryEngine,
    (provider) =>
      new CapabilityDiscoveryEngine(
        provider.resolve<IConfigurationProvider>(RuntimeTokens.ConfigurationService),
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<GatewayPlatform>(GatewayTokens.GatewayPlatform),
        provider.resolve<IEndpointRegistry>(GatewayTokens.EndpointRegistry),
        provider.resolve<ISDKRegistry>(SDKTokens.SDKRegistry),
        provider.resolve<ILifecycleRegistry>(LifecycleTokens.LifecycleRegistry),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
      ),
  );

  registry.registerSingleton(
    CapabilityTokens.CapabilityCompatibilityEngine,
    (provider) =>
      new CapabilityCompatibilityEngine(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<GatewayPlatform>(GatewayTokens.GatewayPlatform),
        provider.resolve<ISDKRegistry>(SDKTokens.SDKRegistry),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
      ),
  );

  registry.registerSingleton(
    CapabilityTokens.CapabilityAvailabilityEngine,
    (provider) =>
      new CapabilityAvailabilityEngine(
        provider.resolve<IConfigurationProvider>(RuntimeTokens.ConfigurationService),
        provider.resolve<ILifecycleRegistry>(LifecycleTokens.LifecycleRegistry),
      ),
  );

  registry.registerSingleton(
    CapabilityTokens.CapabilityCatalog,
    (provider) =>
      new CapabilityCatalogService(
        provider.resolve(CapabilityTokens.CapabilityRegistry),
        provider.resolve(CapabilityTokens.CapabilityDependencyEngine),
        provider.resolve(CapabilityTokens.CapabilityCompatibilityEngine),
        provider.resolve(CapabilityTokens.CapabilityAvailabilityEngine),
      ),
  );

  registry.registerSingleton(
    CapabilityTokens.CapabilityManager,
    (provider) =>
      new CapabilityManager(
        provider.resolve(CapabilityTokens.CapabilityRegistry),
        provider.resolve(CapabilityTokens.CapabilityDiscoveryEngine),
        provider.resolve(CapabilityTokens.CapabilityDependencyEngine),
        provider.resolve(CapabilityTokens.CapabilityAvailabilityEngine),
        provider.resolve(CapabilityTokens.CapabilityCatalog),
      ),
  );

  registry.registerSingleton(CapabilityTokens.CapabilityPlatform, (provider) =>
    new CapabilityPlatform(provider.resolve(CapabilityTokens.CapabilityManager)),
  );
}
