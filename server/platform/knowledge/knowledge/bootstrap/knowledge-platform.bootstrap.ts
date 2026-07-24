import { CapabilityTokens } from "@server/platform/capabilities/capabilities/tokens";
import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { GatewayTokens } from "@server/platform/gateway/gateway/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { LifecycleTokens } from "@server/platform/lifecycle/lifecycle/tokens";
import { SDKTokens } from "@server/platform/sdk/sdk/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import type { GatewayPlatform } from "@server/platform/gateway/gateway/gateway-platform";
import type { IEndpointRegistry } from "@server/platform/gateway/gateway/contracts";
import type { ISDKRegistry } from "@server/platform/sdk/sdk/contracts";
import type { ILifecycleRegistry } from "@server/platform/lifecycle/lifecycle/contracts";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import {
  KnowledgeDiscoveryEngine,
  KnowledgeGraphEngine,
  KnowledgeManager,
  KnowledgePlatform,
  KnowledgeQueryEngine,
  KnowledgeRegistry,
  KnowledgeTokens,
  RelationRegistry,
} from "@server/platform/knowledge/knowledge";

/** Registers knowledge platform services in the DI container. */
export function registerKnowledgePlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(KnowledgeTokens.KnowledgeRegistry, () => new KnowledgeRegistry());
  registry.registerSingleton(KnowledgeTokens.RelationRegistry, () => new RelationRegistry());

  registry.registerSingleton(
    KnowledgeTokens.KnowledgeGraphEngine,
    (provider) =>
      new KnowledgeGraphEngine(
        provider.resolve(KnowledgeTokens.KnowledgeRegistry),
        provider.resolve(KnowledgeTokens.RelationRegistry),
      ),
  );

  registry.registerSingleton(
    KnowledgeTokens.KnowledgeDiscoveryEngine,
    (provider) =>
      new KnowledgeDiscoveryEngine(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<CapabilityPlatform>(CapabilityTokens.CapabilityPlatform),
        provider.resolve<GatewayPlatform>(GatewayTokens.GatewayPlatform),
        provider.resolve<IEndpointRegistry>(GatewayTokens.EndpointRegistry),
        provider.resolve<ISDKRegistry>(SDKTokens.SDKRegistry),
        provider.resolve<ILifecycleRegistry>(LifecycleTokens.LifecycleRegistry),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
      ),
  );

  registry.registerSingleton(
    KnowledgeTokens.KnowledgeQueryEngine,
    (provider) =>
      new KnowledgeQueryEngine(
        provider.resolve(KnowledgeTokens.KnowledgeRegistry),
        provider.resolve(KnowledgeTokens.RelationRegistry),
        provider.resolve(KnowledgeTokens.KnowledgeGraphEngine),
      ),
  );

  registry.registerSingleton(
    KnowledgeTokens.KnowledgeManager,
    (provider) =>
      new KnowledgeManager(
        provider.resolve(KnowledgeTokens.KnowledgeRegistry),
        provider.resolve(KnowledgeTokens.RelationRegistry),
        provider.resolve(KnowledgeTokens.KnowledgeDiscoveryEngine),
        provider.resolve(KnowledgeTokens.KnowledgeQueryEngine),
        provider.resolve(KnowledgeTokens.KnowledgeGraphEngine),
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<CapabilityPlatform>(CapabilityTokens.CapabilityPlatform),
      ),
  );

  registry.registerSingleton(KnowledgeTokens.KnowledgePlatform, (provider) =>
    new KnowledgePlatform(provider.resolve(KnowledgeTokens.KnowledgeManager)),
  );
}
