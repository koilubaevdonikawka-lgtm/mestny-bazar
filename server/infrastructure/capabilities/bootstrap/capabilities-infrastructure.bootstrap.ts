import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";
import {
  CapabilityTokens,
  createCapabilityDescriptor,
  type CapabilityPlatform,
} from "@server/platform/capabilities/capabilities";

/** Activates capability platform metadata and default capability catalog. */
export function activateCapabilityPlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-capabilities",
      name: "Capability Platform",
      path: "server/platform/capabilities",
      components: [
        "CapabilityPlatform",
        "CapabilityManager",
        "CapabilityRegistry",
        "CapabilityDiscoveryEngine",
        "CapabilityDependencyEngine",
        "CapabilityCompatibilityEngine",
        "CapabilityAvailabilityEngine",
        "CapabilityCatalog",
      ],
      dependencies: [
        "platform-documentation",
        "platform-runtime",
        "platform-sdk",
        "platform-gateway",
        "platform-lifecycle",
        "platform-integration",
      ],
    }),
  });

  const capabilityPlatform = provider.resolve<CapabilityPlatform>(
    CapabilityTokens.CapabilityPlatform,
  );

  capabilityPlatform.registerCapability(
    createCapabilityDescriptor({
      id: "capability-platform-core",
      name: "Platform Capability Registry",
      kind: "platform",
      description: "Central platform capability catalog",
    }),
  );

  capabilityPlatform.registerCapability(
    createCapabilityDescriptor({
      id: "capability-gateway-routing",
      name: "Gateway Routing",
      kind: "gateway",
      description: "Gateway endpoint routing capability",
      dependencies: ["capability-platform-core"],
    }),
  );

  capabilityPlatform.registerCapability(
    createCapabilityDescriptor({
      id: "capability-sdk-clients",
      name: "SDK Client Integration",
      kind: "sdk",
      description: "SDK client capability metadata",
      dependencies: ["capability-platform-core"],
    }),
  );

  capabilityPlatform.discoverCapabilities();
  capabilityPlatform.generateCatalog();
}
