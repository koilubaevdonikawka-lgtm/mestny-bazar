import type { ICapabilityDiscoveryEngine } from "@server/platform/capabilities/capabilities/contracts";
import {
  createCapabilityDescriptor,
  type CapabilityDescriptor,
} from "@server/platform/capabilities/capabilities/models";
import { createCapabilitiesDiscoveredEvent } from "@server/platform/capabilities/capabilities/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GatewayPlatform } from "@server/platform/gateway/gateway/gateway-platform";
import type { IEndpointRegistry } from "@server/platform/gateway/gateway/contracts";
import type { ISDKRegistry } from "@server/platform/sdk/sdk/contracts";
import type { ILifecycleRegistry } from "@server/platform/lifecycle/lifecycle/contracts";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { IConfigurationProvider } from "@server/platform/runtime/runtime/contracts";

/** Discovers capabilities from platform metadata (no BCM access). */
export class CapabilityDiscoveryEngine implements ICapabilityDiscoveryEngine {
  constructor(
    private readonly configuration: IConfigurationProvider,
    private readonly documentation: DocumentationPlatform,
    private readonly gateway: GatewayPlatform,
    private readonly endpointRegistry: IEndpointRegistry,
    private readonly sdkRegistry: ISDKRegistry,
    private readonly lifecycleRegistry: ILifecycleRegistry,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  discover(): readonly CapabilityDescriptor[] {
    void this.configuration.snapshot();
    const bundle = this.documentation.generateDocumentation();
    const discovered: CapabilityDescriptor[] = [];

    for (const platform of bundle.dependencyGraph.nodes.filter((node) => node.layer === "platform")) {
      discovered.push(
        createCapabilityDescriptor({
          id: `capability-platform-${platform.id}`,
          name: platform.name,
          kind: "platform",
          description: platform.description ?? `Platform capability: ${platform.name}`,
        }),
      );
    }

    for (const entry of bundle.moduleCatalog.entries) {
      discovered.push(
        createCapabilityDescriptor({
          id: `capability-module-${entry.module.id}`,
          name: entry.module.name,
          kind: "module",
          description: `Module capability: ${entry.module.name}`,
          dependencies: entry.registered ? [] : [`capability-platform-${entry.module.id}`],
        }),
      );
    }

    for (const provider of this.providerRegistry.list()) {
      discovered.push(
        createCapabilityDescriptor({
          id: `capability-provider-${provider.id}`,
          name: provider.name,
          kind: "provider",
          description: String(provider.capability),
        }),
      );
    }

    for (const client of this.sdkRegistry.listClients()) {
      discovered.push(
        createCapabilityDescriptor({
          id: `capability-sdk-${client.id}`,
          name: client.name,
          kind: "sdk",
          version: client.version,
          description: `SDK client: ${client.kind}`,
        }),
      );
    }

    for (const version of this.gateway.supportedVersions()) {
      discovered.push(
        createCapabilityDescriptor({
          id: `capability-gateway-v${version.major}-${version.minor}`,
          name: `Gateway API v${version.major}.${version.minor}`,
          kind: "gateway",
          version: `${version.major}.${version.minor}`,
        }),
      );
    }

    for (const endpoint of this.endpointRegistry.listEndpoints()) {
      discovered.push(
        createCapabilityDescriptor({
          id: `capability-gateway-endpoint-${endpoint.id}`,
          name: endpoint.path,
          kind: "gateway",
          description: `${endpoint.method} ${endpoint.path}`,
        }),
      );
    }

    for (const component of this.lifecycleRegistry.list()) {
      discovered.push(
        createCapabilityDescriptor({
          id: `capability-lifecycle-${component.id}`,
          name: component.name,
          kind: "platform",
          description: `Lifecycle component: ${component.kind}`,
          dependencies: [...component.dependencies],
        }),
      );
    }

    createCapabilitiesDiscoveredEvent(discovered);
    return Object.freeze([...discovered]);
  }
}
