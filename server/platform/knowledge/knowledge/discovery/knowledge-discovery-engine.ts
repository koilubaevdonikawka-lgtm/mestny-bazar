import type { IKnowledgeDiscoveryEngine } from "@server/platform/knowledge/knowledge/contracts";
import {
  createKnowledgeNode,
  type KnowledgeNode,
} from "@server/platform/knowledge/knowledge/models";
import { createKnowledgeDiscoveredEvent } from "@server/platform/knowledge/knowledge/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import type { GatewayPlatform } from "@server/platform/gateway/gateway/gateway-platform";
import type { IEndpointRegistry } from "@server/platform/gateway/gateway/contracts";
import type { ISDKRegistry } from "@server/platform/sdk/sdk/contracts";
import type { ILifecycleRegistry } from "@server/platform/lifecycle/lifecycle/contracts";
import type { ProviderRegistry } from "@server/platform/integration/integration";

/** Discovers knowledge nodes from platform metadata (no BCM access). */
export class KnowledgeDiscoveryEngine implements IKnowledgeDiscoveryEngine {
  constructor(
    private readonly documentation: DocumentationPlatform,
    private readonly capabilityPlatform: CapabilityPlatform,
    private readonly gateway: GatewayPlatform,
    private readonly endpointRegistry: IEndpointRegistry,
    private readonly sdkRegistry: ISDKRegistry,
    private readonly lifecycleRegistry: ILifecycleRegistry,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  discover(): readonly KnowledgeNode[] {
    const bundle = this.documentation.generateDocumentation();
    const discovered: KnowledgeNode[] = [];

    for (const node of bundle.dependencyGraph.nodes.filter((entry) => entry.layer === "platform")) {
      discovered.push(
        createKnowledgeNode({
          id: `knowledge-platform-${node.id}`,
          name: node.name,
          kind: "platform",
          description: node.description ?? `Platform node: ${node.name}`,
          metadata: Object.freeze({ layer: node.layer, kind: node.kind }),
        }),
      );
    }

    for (const entry of bundle.moduleCatalog.entries) {
      discovered.push(
        createKnowledgeNode({
          id: `knowledge-module-${entry.module.id}`,
          name: entry.module.name,
          kind: "module",
          description: `Module node: ${entry.module.name}`,
          metadata: Object.freeze({ registered: entry.registered }),
        }),
      );
    }

    for (const capability of this.capabilityPlatform.listCapabilities()) {
      discovered.push(
        createKnowledgeNode({
          id: `knowledge-capability-${capability.id}`,
          name: capability.name,
          kind: capability.kind === "gateway" ? "gateway" : capability.kind === "sdk" ? "sdk" : capability.kind === "provider" ? "provider" : "platform",
          description: capability.description,
          metadata: Object.freeze({ version: capability.version, source: "capability-catalog" }),
        }),
      );
    }

    for (const provider of this.providerRegistry.list()) {
      discovered.push(
        createKnowledgeNode({
          id: `knowledge-provider-${provider.id}`,
          name: provider.name,
          kind: "provider",
          description: String(provider.capability),
        }),
      );
    }

    for (const client of this.sdkRegistry.listClients()) {
      discovered.push(
        createKnowledgeNode({
          id: `knowledge-sdk-${client.id}`,
          name: client.name,
          kind: "sdk",
          description: `SDK client: ${client.kind}`,
          metadata: Object.freeze({ version: client.version }),
        }),
      );
    }

    for (const version of this.gateway.supportedVersions()) {
      discovered.push(
        createKnowledgeNode({
          id: `knowledge-gateway-v${version.major}-${version.minor}`,
          name: `Gateway v${version.major}.${version.minor}`,
          kind: "gateway",
          metadata: Object.freeze({ version: `${version.major}.${version.minor}` }),
        }),
      );
    }

    for (const endpoint of this.endpointRegistry.listEndpoints()) {
      discovered.push(
        createKnowledgeNode({
          id: `knowledge-gateway-endpoint-${endpoint.id}`,
          name: endpoint.path,
          kind: "gateway",
          description: `${endpoint.method} ${endpoint.path}`,
        }),
      );
    }

    for (const component of this.lifecycleRegistry.list()) {
      discovered.push(
        createKnowledgeNode({
          id: `knowledge-lifecycle-${component.id}`,
          name: component.name,
          kind: "platform",
          description: `Lifecycle component: ${component.kind}`,
          metadata: Object.freeze({ platformId: component.platformId }),
        }),
      );
    }

    createKnowledgeDiscoveredEvent(discovered);
    return Object.freeze([...discovered]);
  }
}
