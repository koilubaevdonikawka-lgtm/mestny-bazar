/**
 * Future integration ports for Plugin Management.
 * Not implemented — reserved for external plugin sources.
 */

import type { PluginDefinition } from "@server/application/plugin-management/models/plugin.model";

/** NPM Plugin Provider — npm registry integration. */
export interface INpmPluginProvider {
  fetchPlugin(name: string, version: string): Promise<PluginDefinition>;
  publishPlugin(plugin: PluginDefinition): Promise<void>;
}

/** Docker Plugin Provider — Docker container plugin integration. */
export interface IDockerPluginProvider {
  pullImage(image: string): Promise<PluginDefinition>;
  removeImage(image: string): Promise<void>;
}

/** Remote Plugin Repository — remote plugin storage. */
export interface IRemotePluginRepository {
  upload(plugin: PluginDefinition): Promise<void>;
  download(pluginId: string): Promise<PluginDefinition | null>;
}

/** Plugin Marketplace Provider — marketplace integration. */
export interface IPluginMarketplaceProvider {
  searchPlugins(query: string): Promise<readonly PluginDefinition[]>;
  installFromMarketplace(pluginId: string): Promise<PluginDefinition>;
}

/** Plugin Sandbox Provider — isolated plugin execution. */
export interface IPluginSandboxProvider {
  runInSandbox(pluginId: string, input: Record<string, string>): Promise<Record<string, string>>;
  destroySandbox(pluginId: string): Promise<void>;
}
