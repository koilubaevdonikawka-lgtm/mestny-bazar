import type { IPluginRepository } from "@server/application/plugin-management/contracts/plugin-repository.contract";
import type { PluginDefinition } from "@server/application/plugin-management/models/plugin.model";

/** In-memory plugin store. */
export class PluginRepository implements IPluginRepository {
  private readonly plugins = new Map<string, PluginDefinition>();

  async save(plugin: PluginDefinition): Promise<void> {
    this.plugins.set(plugin.pluginId, plugin);
  }

  async findById(pluginId: string): Promise<PluginDefinition | null> {
    return this.plugins.get(pluginId.trim()) ?? null;
  }

  async delete(pluginId: string): Promise<void> {
    this.plugins.delete(pluginId.trim());
  }

  async findAll(): Promise<readonly PluginDefinition[]> {
    return Object.freeze([...this.plugins.values()]);
  }
}
