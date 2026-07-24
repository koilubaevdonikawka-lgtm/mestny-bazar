import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";
import {
  createSDKVersion,
  DEFAULT_SDK_CLIENTS,
  SDKTokens,
  type SDKRegistry,
} from "@server/platform/sdk/sdk";

const SUPPORTED_PLATFORMS = Object.freeze([
  "platform-documentation",
  "platform-governance",
  "platform-release",
  "platform-evolution",
  "platform-integration",
]);

/** Activates SDK platform metadata and default client registrations. */
export function activateSDKPlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-sdk",
      name: "SDK Platform",
      path: "server/platform/sdk",
      components: [
        "SDKPlatform",
        "SDKManager",
        "SDKRegistry",
        "SerializationEngine",
        "SDKCompatibilityEngine",
        "SDKGenerator",
      ],
      dependencies: [
        "platform-documentation",
        "platform-governance",
        "platform-release",
        "platform-evolution",
        "platform-integration",
      ],
    }),
  });

  const registry = provider.resolve<SDKRegistry>(SDKTokens.SDKRegistry);
  registry.registerVersion(createSDKVersion({ major: 1, minor: 0, patch: 0 }));

  for (const platformId of SUPPORTED_PLATFORMS) {
    registry.registerSupportedPlatform(platformId);
  }

  for (const client of DEFAULT_SDK_CLIENTS) {
    try {
      registry.registerClient(client);
    } catch {
      // Client may already be registered during repeated bootstrap.
    }
  }
}
