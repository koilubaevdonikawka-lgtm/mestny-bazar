/**
 * Future integration ports for AI Capability Discovery.
 * Not implemented — reserved for external capability sources.
 */

import type { AiCapability } from "@server/application/ai-capability-discovery/models/capability.model";

/** MCP Capability Provider — Model Context Protocol integration. */
export interface IMcpCapabilityProvider {
  discoverCapabilities(): Promise<readonly AiCapability[]>;
}

/** OpenAPI Capability Provider — OpenAPI specification integration. */
export interface IOpenApiCapabilityProvider {
  discoverFromSpec(specUrl: string): Promise<readonly AiCapability[]>;
}

/** Plugin Capability Provider — plugin-based capability integration. */
export interface IPluginCapabilityProvider {
  discoverFromPlugin(pluginId: string): Promise<readonly AiCapability[]>;
}

/** Remote Capability Provider — remote service capability integration. */
export interface IRemoteCapabilityProvider {
  fetchRemoteCapabilities(endpoint: string): Promise<readonly AiCapability[]>;
}

/** Capability Discovery Provider — unified external discovery coordination. */
export interface ICapabilityDiscoveryProvider {
  discoverAll(): Promise<readonly AiCapability[]>;
}
