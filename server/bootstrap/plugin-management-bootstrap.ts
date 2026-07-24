import type { IPluginInstaller } from "@server/application/plugin-management/contracts/plugin-installer.contract";
import type { IPluginLifecycleManager } from "@server/application/plugin-management/contracts/plugin-lifecycle-manager.contract";
import type { IPluginLoader } from "@server/application/plugin-management/contracts/plugin-loader.contract";
import type { IPluginRepository } from "@server/application/plugin-management/contracts/plugin-repository.contract";
import type { IPluginValidator } from "@server/application/plugin-management/contracts/plugin-validator.contract";
import {
  DisablePluginUseCase,
  EnablePluginUseCase,
  GetPluginStatusUseCase,
  GetPluginUseCase,
  InstallPluginUseCase,
  ListPluginsUseCase,
  PluginManagementApplicationService,
  PluginManagementService,
  RegisterPluginUseCase,
  UninstallPluginUseCase,
} from "@server/application/plugin-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultPluginInstaller } from "@server/infrastructure/plugin-management/default-plugin.installer";
import { DefaultPluginLifecycleManager } from "@server/infrastructure/plugin-management/default-plugin-lifecycle.manager";
import { DefaultPluginLoader } from "@server/infrastructure/plugin-management/default-plugin.loader";
import { DefaultPluginValidator } from "@server/infrastructure/plugin-management/default-plugin.validator";
import { PluginRepository } from "@server/infrastructure/plugin-management/plugin.repository";

/** Registers plugin management services and use cases. */
export function registerPluginManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.PluginManagementPluginRepository, () =>
    new PluginRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.PluginManagementPluginInstaller, () =>
    new DefaultPluginInstaller(),
  );

  registry.registerSingleton(InfrastructureTokens.PluginManagementPluginLoader, () =>
    new DefaultPluginLoader(),
  );

  registry.registerSingleton(InfrastructureTokens.PluginManagementPluginValidator, () =>
    new DefaultPluginValidator(),
  );

  registry.registerSingleton(InfrastructureTokens.PluginManagementPluginLifecycleManager, () =>
    new DefaultPluginLifecycleManager(),
  );

  registry.registerTransient(InfrastructureTokens.PluginManagementService, (provider) =>
    new PluginManagementService(
      provider.resolve<IPluginRepository>(InfrastructureTokens.PluginManagementPluginRepository),
      provider.resolve<IPluginInstaller>(InfrastructureTokens.PluginManagementPluginInstaller),
      provider.resolve<IPluginLoader>(InfrastructureTokens.PluginManagementPluginLoader),
      provider.resolve<IPluginValidator>(InfrastructureTokens.PluginManagementPluginValidator),
      provider.resolve<IPluginLifecycleManager>(
        InfrastructureTokens.PluginManagementPluginLifecycleManager,
      ),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.PluginManagementRegisterPluginUseCase,
    (provider) =>
      new RegisterPluginUseCase(
        provider.resolve<PluginManagementService>(InfrastructureTokens.PluginManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.PluginManagementInstallPluginUseCase,
    (provider) =>
      new InstallPluginUseCase(
        provider.resolve<PluginManagementService>(InfrastructureTokens.PluginManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.PluginManagementUninstallPluginUseCase,
    (provider) =>
      new UninstallPluginUseCase(
        provider.resolve<PluginManagementService>(InfrastructureTokens.PluginManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.PluginManagementEnablePluginUseCase,
    (provider) =>
      new EnablePluginUseCase(
        provider.resolve<PluginManagementService>(InfrastructureTokens.PluginManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.PluginManagementDisablePluginUseCase,
    (provider) =>
      new DisablePluginUseCase(
        provider.resolve<PluginManagementService>(InfrastructureTokens.PluginManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.PluginManagementGetPluginUseCase,
    (provider) =>
      new GetPluginUseCase(
        provider.resolve<PluginManagementService>(InfrastructureTokens.PluginManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.PluginManagementListPluginsUseCase,
    (provider) =>
      new ListPluginsUseCase(
        provider.resolve<PluginManagementService>(InfrastructureTokens.PluginManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.PluginManagementGetPluginStatusUseCase,
    (provider) =>
      new GetPluginStatusUseCase(
        provider.resolve<PluginManagementService>(InfrastructureTokens.PluginManagementService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.PluginManagementApplicationService,
    (provider) =>
      new PluginManagementApplicationService(
        provider.resolve<RegisterPluginUseCase>(
          InfrastructureTokens.PluginManagementRegisterPluginUseCase,
        ),
        provider.resolve<InstallPluginUseCase>(
          InfrastructureTokens.PluginManagementInstallPluginUseCase,
        ),
        provider.resolve<UninstallPluginUseCase>(
          InfrastructureTokens.PluginManagementUninstallPluginUseCase,
        ),
        provider.resolve<EnablePluginUseCase>(
          InfrastructureTokens.PluginManagementEnablePluginUseCase,
        ),
        provider.resolve<DisablePluginUseCase>(
          InfrastructureTokens.PluginManagementDisablePluginUseCase,
        ),
        provider.resolve<GetPluginUseCase>(
          InfrastructureTokens.PluginManagementGetPluginUseCase,
        ),
        provider.resolve<ListPluginsUseCase>(
          InfrastructureTokens.PluginManagementListPluginsUseCase,
        ),
        provider.resolve<GetPluginStatusUseCase>(
          InfrastructureTokens.PluginManagementGetPluginStatusUseCase,
        ),
      ),
  );
}
