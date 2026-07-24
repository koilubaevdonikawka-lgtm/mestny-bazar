import type { IPluginInstaller } from "@server/application/plugin-management/contracts/plugin-installer.contract";
import { createPluginDefinition } from "@server/application/plugin-management/models/plugin.model";
import type { PluginDefinition } from "@server/application/plugin-management/models/plugin.model";

/** Default in-memory plugin installer — metadata only, no external code. */
export class DefaultPluginInstaller implements IPluginInstaller {
  private readonly installed = new Set<string>();

  async install(plugin: PluginDefinition): Promise<PluginDefinition> {
    this.installed.add(plugin.pluginId);
    return createPluginDefinition({
      ...plugin,
      status: "installed",
      updatedAt: new Date().toISOString(),
    });
  }

  async uninstall(pluginId: string): Promise<void> {
    this.installed.delete(pluginId.trim());
  }

  isInstalled(pluginId: string): boolean {
    return this.installed.has(pluginId.trim());
  }
}
