import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";
import {
  createApiVersionDescriptor,
  DEFAULT_GATEWAY_ENDPOINTS,
  DEFAULT_GATEWAY_ROUTES,
  DEFAULT_SCHEMAS,
  GatewayTokens,
  type EndpointRegistry,
  type SchemaRegistry,
  type ApiVersionManager,
} from "@server/platform/gateway/gateway";

/** Activates gateway platform metadata and default endpoints. */
export function activateGatewayPlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-gateway",
      name: "Gateway Platform",
      path: "server/platform/gateway",
      components: [
        "GatewayPlatform",
        "GatewayManager",
        "EndpointRegistry",
        "RouteResolver",
        "EndpointDispatcher",
        "GatewayMiddlewarePipeline",
        "SchemaRegistry",
        "ApiVersionManager",
      ],
      dependencies: [
        "platform-sdk",
        "platform-documentation",
        "platform-governance",
        "platform-release",
        "platform-integration",
      ],
    }),
  });

  const versionManager = provider.resolve<ApiVersionManager>(GatewayTokens.ApiVersionManager);
  versionManager.registerVersion(createApiVersionDescriptor({ major: 1, minor: 0 }));
  versionManager.setCurrentVersion(createApiVersionDescriptor({ major: 1, minor: 0 }));

  const schemaRegistry = provider.resolve<SchemaRegistry>(GatewayTokens.SchemaRegistry);
  for (const schema of DEFAULT_SCHEMAS) {
    try {
      schemaRegistry.registerSchema(schema);
    } catch {
      // Schema may already be registered during repeated bootstrap.
    }
  }

  const endpointRegistry = provider.resolve<EndpointRegistry>(GatewayTokens.EndpointRegistry);
  for (const endpoint of DEFAULT_GATEWAY_ENDPOINTS) {
    try {
      endpointRegistry.registerEndpoint(endpoint);
    } catch {
      // Endpoint may already be registered during repeated bootstrap.
    }
  }

  for (const route of DEFAULT_GATEWAY_ROUTES) {
    try {
      endpointRegistry.registerRoute(route);
    } catch {
      // Route may already be registered during repeated bootstrap.
    }
  }
}
