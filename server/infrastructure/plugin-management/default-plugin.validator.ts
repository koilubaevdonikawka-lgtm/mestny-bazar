import type { IPluginValidator } from "@server/application/plugin-management/contracts/plugin-validator.contract";
import type {
  InstallPluginInput,
  PluginDefinition,
  RegisterPluginInput,
} from "@server/application/plugin-management/models/plugin.model";

/** Default plugin validator — registration and lifecycle rules. */
export class DefaultPluginValidator implements IPluginValidator {
  validateRegistration(input: RegisterPluginInput): void {
    if (!input.name.trim()) {
      throw new Error("Plugin name is required.");
    }
    if (!input.version.trim()) {
      throw new Error("Plugin version is required.");
    }
  }

  validateInstall(plugin: PluginDefinition, _input: InstallPluginInput): void {
    if (plugin.status !== "registered") {
      throw new Error(`Plugin must be registered before install. Current status: ${plugin.status}`);
    }
  }

  validateEnable(plugin: PluginDefinition): void {
    if (plugin.status !== "installed" && plugin.status !== "disabled") {
      throw new Error(`Plugin must be installed or disabled before enable. Current status: ${plugin.status}`);
    }
  }

  validateDisable(plugin: PluginDefinition): void {
    if (plugin.status !== "enabled") {
      throw new Error(`Plugin must be enabled before disable. Current status: ${plugin.status}`);
    }
  }

  validateUninstall(plugin: PluginDefinition): void {
    if (plugin.status === "enabled") {
      throw new Error("Plugin must be disabled before uninstall.");
    }
  }
}
