import type { PluginDefinition } from "@server/application/plugin-management/models/plugin.model";

export interface IPluginRepository {
  save(plugin: PluginDefinition): Promise<void>;
  findById(pluginId: string): Promise<PluginDefinition | null>;
  delete(pluginId: string): Promise<void>;
  findAll(): Promise<readonly PluginDefinition[]>;
}
