import type { PluginDefinition } from "@server/application/plugin-management/models/plugin.model";

export interface IPluginInstaller {
  install(plugin: PluginDefinition): Promise<PluginDefinition>;
  uninstall(pluginId: string): Promise<void>;
}
