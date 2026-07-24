import type { PluginDefinition } from "@server/application/plugin-management/models/plugin.model";

export interface IPluginLifecycleManager {
  enable(plugin: PluginDefinition): Promise<PluginDefinition>;
  disable(plugin: PluginDefinition): Promise<PluginDefinition>;
}
