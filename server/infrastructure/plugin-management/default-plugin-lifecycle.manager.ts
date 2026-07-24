import type { IPluginLifecycleManager } from "@server/application/plugin-management/contracts/plugin-lifecycle-manager.contract";
import { createPluginDefinition } from "@server/application/plugin-management/models/plugin.model";
import type { PluginDefinition } from "@server/application/plugin-management/models/plugin.model";

/** Default plugin lifecycle manager — enable/disable transitions. */
export class DefaultPluginLifecycleManager implements IPluginLifecycleManager {
  async enable(plugin: PluginDefinition): Promise<PluginDefinition> {
    return createPluginDefinition({
      ...plugin,
      status: "enabled",
      updatedAt: new Date().toISOString(),
    });
  }

  async disable(plugin: PluginDefinition): Promise<PluginDefinition> {
    return createPluginDefinition({
      ...plugin,
      status: "disabled",
      updatedAt: new Date().toISOString(),
    });
  }
}
