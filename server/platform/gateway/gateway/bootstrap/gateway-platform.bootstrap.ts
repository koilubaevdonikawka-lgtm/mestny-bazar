import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { GovernanceTokens } from "@server/platform/governance/governance/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { ReleaseTokens } from "@server/platform/release/release/tokens";
import { SDKTokens } from "@server/platform/sdk/sdk/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { ReleasePlatform } from "@server/platform/release/release/release-platform";
import type { SDKPlatform } from "@server/platform/sdk/sdk/sdk-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import {
  ApiVersionManager,
  EndpointDispatcher,
  EndpointRegistry,
  GatewayManager,
  GatewayMiddlewarePipeline,
  GatewayPlatform,
  GatewayTokens,
  RouteResolver,
  SchemaRegistry,
  VersionRouter,
} from "@server/platform/gateway/gateway";

/** Registers gateway platform services in the DI container. */
export function registerGatewayPlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(GatewayTokens.EndpointRegistry, () => new EndpointRegistry());
  registry.registerSingleton(GatewayTokens.ApiVersionManager, () => new ApiVersionManager());
  registry.registerSingleton(GatewayTokens.SchemaRegistry, () => new SchemaRegistry());
  registry.registerSingleton(GatewayTokens.GatewayMiddlewarePipeline, () => new GatewayMiddlewarePipeline());

  registry.registerSingleton(
    GatewayTokens.VersionRouter,
    (provider) => new VersionRouter(provider.resolve(GatewayTokens.ApiVersionManager)),
  );

  registry.registerSingleton(
    GatewayTokens.RouteResolver,
    (provider) =>
      new RouteResolver(
        provider.resolve(GatewayTokens.EndpointRegistry),
        provider.resolve(GatewayTokens.VersionRouter),
      ),
  );

  registry.registerSingleton(
    GatewayTokens.EndpointDispatcher,
    (provider) =>
      new EndpointDispatcher(
        provider.resolve(GatewayTokens.EndpointRegistry),
        provider.resolve(GatewayTokens.RouteResolver),
        provider.resolve(GatewayTokens.GatewayMiddlewarePipeline),
      ),
  );

  registry.registerSingleton(
    GatewayTokens.GatewayManager,
    (provider) =>
      new GatewayManager(
        provider.resolve(GatewayTokens.EndpointRegistry),
        provider.resolve(GatewayTokens.RouteResolver),
        provider.resolve(GatewayTokens.EndpointDispatcher),
        provider.resolve(GatewayTokens.SchemaRegistry),
        provider.resolve(GatewayTokens.ApiVersionManager),
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<GovernancePlatform>(GovernanceTokens.GovernancePlatform),
        provider.resolve<ReleasePlatform>(ReleaseTokens.ReleasePlatform),
        provider.resolve<SDKPlatform>(SDKTokens.SDKPlatform),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
      ),
  );

  registry.registerSingleton(GatewayTokens.GatewayPlatform, (provider) =>
    new GatewayPlatform(
      provider.resolve(GatewayTokens.GatewayManager),
      provider.resolve(GatewayTokens.ApiVersionManager),
    ),
  );
}
