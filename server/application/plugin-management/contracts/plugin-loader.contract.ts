import type { PluginDefinition } from "@server/application/plugin-management/models/plugin.model";

export interface IPluginLoader {
  load(plugin: PluginDefinition): Promise<{ loaded: boolean }>;
  unload(pluginId: string): Promise<void>;
}
