import type {
  InstallPluginInput,
  ListPluginsResult,
  PluginDefinition,
  PluginStatus,
  RegisterPluginInput,
} from "@server/application/plugin-management/models/plugin.model";
import type { PluginManagementService } from "@server/application/plugin-management/services/plugin-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterPluginUseCase {
  constructor(private readonly plugins: PluginManagementService) {}

  execute(input: RegisterPluginInput): Promise<UseCaseResult<PluginDefinition>> {
    return this.plugins.registerPlugin(input).then(useCaseResult);
  }
}

export class InstallPluginUseCase {
  constructor(private readonly plugins: PluginManagementService) {}

  execute(input: InstallPluginInput): Promise<UseCaseResult<PluginDefinition>> {
    return this.plugins.installPlugin(input).then(useCaseResult);
  }
}

export class UninstallPluginUseCase {
  constructor(private readonly plugins: PluginManagementService) {}

  execute(pluginId: string): Promise<UseCaseResult<{ pluginId: string; uninstalled: boolean }>> {
    return this.plugins.uninstallPlugin(pluginId).then(useCaseResult);
  }
}

export class EnablePluginUseCase {
  constructor(private readonly plugins: PluginManagementService) {}

  execute(pluginId: string): Promise<UseCaseResult<PluginDefinition>> {
    return this.plugins.enablePlugin(pluginId).then(useCaseResult);
  }
}

export class DisablePluginUseCase {
  constructor(private readonly plugins: PluginManagementService) {}

  execute(pluginId: string): Promise<UseCaseResult<PluginDefinition>> {
    return this.plugins.disablePlugin(pluginId).then(useCaseResult);
  }
}

export class GetPluginUseCase {
  constructor(private readonly plugins: PluginManagementService) {}

  execute(pluginId: string): Promise<UseCaseResult<PluginDefinition | null>> {
    return this.plugins.getPlugin(pluginId).then(useCaseResult);
  }
}

export class ListPluginsUseCase {
  constructor(private readonly plugins: PluginManagementService) {}

  execute(): Promise<UseCaseResult<ListPluginsResult>> {
    return this.plugins.listPlugins().then(useCaseResult);
  }
}

export class GetPluginStatusUseCase {
  constructor(private readonly plugins: PluginManagementService) {}

  execute(pluginId: string): Promise<UseCaseResult<PluginStatus>> {
    return this.plugins.getPluginStatus(pluginId).then(useCaseResult);
  }
}
