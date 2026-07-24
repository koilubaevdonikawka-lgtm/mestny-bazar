import type { IPluginLoader } from "@server/application/plugin-management/contracts/plugin-loader.contract";
import type { PluginDefinition } from "@server/application/plugin-management/models/plugin.model";

/** Default in-memory plugin loader — no third-party code loading. */
export class DefaultPluginLoader implements IPluginLoader {
  private readonly loaded = new Set<string>();

  async load(plugin: PluginDefinition): Promise<{ loaded: boolean }> {
    this.loaded.add(plugin.pluginId);
    return Object.freeze({ loaded: true });
  }

  async unload(pluginId: string): Promise<void> {
    this.loaded.delete(pluginId.trim());
  }

  isLoaded(pluginId: string): boolean {
    return this.loaded.has(pluginId.trim());
  }
}
