import type {
  InstallPluginInput,
  RegisterPluginInput,
} from "@server/application/plugin-management/models/plugin.model";
import {
  DisablePluginUseCase,
  EnablePluginUseCase,
  GetPluginStatusUseCase,
  GetPluginUseCase,
  InstallPluginUseCase,
  ListPluginsUseCase,
  RegisterPluginUseCase,
  UninstallPluginUseCase,
} from "@server/application/plugin-management/use-cases/plugin-management.use-cases";

/** Application facade for plugin management scenario. */
export class PluginManagementApplicationService {
  constructor(
    private readonly registerPluginUseCase: RegisterPluginUseCase,
    private readonly installPluginUseCase: InstallPluginUseCase,
    private readonly uninstallPluginUseCase: UninstallPluginUseCase,
    private readonly enablePluginUseCase: EnablePluginUseCase,
    private readonly disablePluginUseCase: DisablePluginUseCase,
    private readonly getPluginUseCase: GetPluginUseCase,
    private readonly listPluginsUseCase: ListPluginsUseCase,
    private readonly getPluginStatusUseCase: GetPluginStatusUseCase,
  ) {}

  registerPlugin(input: RegisterPluginInput) {
    return this.registerPluginUseCase.execute(input);
  }

  installPlugin(input: InstallPluginInput) {
    return this.installPluginUseCase.execute(input);
  }

  uninstallPlugin(pluginId: string) {
    return this.uninstallPluginUseCase.execute(pluginId);
  }

  enablePlugin(pluginId: string) {
    return this.enablePluginUseCase.execute(pluginId);
  }

  disablePlugin(pluginId: string) {
    return this.disablePluginUseCase.execute(pluginId);
  }

  getPlugin(pluginId: string) {
    return this.getPluginUseCase.execute(pluginId);
  }

  listPlugins() {
    return this.listPluginsUseCase.execute();
  }

  getPluginStatus(pluginId: string) {
    return this.getPluginStatusUseCase.execute(pluginId);
  }
}
