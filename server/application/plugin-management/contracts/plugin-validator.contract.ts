import type {
  InstallPluginInput,
  PluginDefinition,
  RegisterPluginInput,
} from "@server/application/plugin-management/models/plugin.model";

export interface IPluginValidator {
  validateRegistration(input: RegisterPluginInput): void;
  validateInstall(plugin: PluginDefinition, input: InstallPluginInput): void;
  validateEnable(plugin: PluginDefinition): void;
  validateDisable(plugin: PluginDefinition): void;
  validateUninstall(plugin: PluginDefinition): void;
}
