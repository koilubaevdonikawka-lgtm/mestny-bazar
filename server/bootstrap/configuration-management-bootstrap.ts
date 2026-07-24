import type { IConfigurationEncryptionProvider } from "@server/application/configuration-management/contracts/configuration-encryption-provider.contract";
import type { IConfigurationImportExportProvider } from "@server/application/configuration-management/contracts/configuration-import-export-provider.contract";
import type { IConfigurationRepository } from "@server/application/configuration-management/contracts/configuration-repository.contract";
import type { IConfigurationSerializer } from "@server/application/configuration-management/contracts/configuration-serializer.contract";
import type { IConfigurationValidator } from "@server/application/configuration-management/contracts/configuration-validator.contract";
import {
  ConfigurationExistsUseCase,
  ConfigurationManagementApplicationService,
  ConfigurationManagementService,
  DeleteConfigurationUseCase,
  ExportConfigurationUseCase,
  GetConfigurationUseCase,
  ImportConfigurationUseCase,
  ListConfigurationsUseCase,
  RegisterConfigurationUseCase,
  UpdateConfigurationUseCase,
} from "@server/application/configuration-management";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ConfigurationRepository } from "@server/infrastructure/configuration-management/configuration.repository";
import { DefaultConfigurationImportExportProvider } from "@server/infrastructure/configuration-management/default-configuration-import-export.provider";
import { DefaultConfigurationValidator } from "@server/infrastructure/configuration-management/default-configuration.validator";
import { JsonConfigurationSerializer } from "@server/infrastructure/configuration-management/json-configuration.serializer";
import { NoopConfigurationEncryptionProvider } from "@server/infrastructure/configuration-management/noop-configuration-encryption.provider";

/** Registers configuration management services and use cases. */
export function registerConfigurationManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.ConfigurationManagementRepository, () =>
    new ConfigurationRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.ConfigurationManagementSerializer, () =>
    new JsonConfigurationSerializer(),
  );

  registry.registerSingleton(InfrastructureTokens.ConfigurationManagementValidator, () =>
    new DefaultConfigurationValidator(),
  );

  registry.registerSingleton(InfrastructureTokens.ConfigurationManagementEncryptionProvider, () =>
    new NoopConfigurationEncryptionProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.ConfigurationManagementImportExportProvider, () =>
    new DefaultConfigurationImportExportProvider(),
  );

  registry.registerTransient(InfrastructureTokens.ConfigurationManagementService, (provider) =>
    new ConfigurationManagementService(
      provider.resolve<IConfigurationRepository>(
        InfrastructureTokens.ConfigurationManagementRepository,
      ),
      provider.resolve<IConfigurationSerializer>(
        InfrastructureTokens.ConfigurationManagementSerializer,
      ),
      provider.resolve<IConfigurationValidator>(InfrastructureTokens.ConfigurationManagementValidator),
      provider.resolve<IConfigurationEncryptionProvider>(
        InfrastructureTokens.ConfigurationManagementEncryptionProvider,
      ),
      provider.resolve<IConfigurationImportExportProvider>(
        InfrastructureTokens.ConfigurationManagementImportExportProvider,
      ),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.ConfigurationManagementRegisterConfigurationUseCase,
    (provider) =>
      new RegisterConfigurationUseCase(
        provider.resolve<ConfigurationManagementService>(
          InfrastructureTokens.ConfigurationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.ConfigurationManagementGetConfigurationUseCase,
    (provider) =>
      new GetConfigurationUseCase(
        provider.resolve<ConfigurationManagementService>(
          InfrastructureTokens.ConfigurationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.ConfigurationManagementUpdateConfigurationUseCase,
    (provider) =>
      new UpdateConfigurationUseCase(
        provider.resolve<ConfigurationManagementService>(
          InfrastructureTokens.ConfigurationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.ConfigurationManagementDeleteConfigurationUseCase,
    (provider) =>
      new DeleteConfigurationUseCase(
        provider.resolve<ConfigurationManagementService>(
          InfrastructureTokens.ConfigurationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.ConfigurationManagementListConfigurationsUseCase,
    (provider) =>
      new ListConfigurationsUseCase(
        provider.resolve<ConfigurationManagementService>(
          InfrastructureTokens.ConfigurationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.ConfigurationManagementConfigurationExistsUseCase,
    (provider) =>
      new ConfigurationExistsUseCase(
        provider.resolve<ConfigurationManagementService>(
          InfrastructureTokens.ConfigurationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.ConfigurationManagementExportConfigurationUseCase,
    (provider) =>
      new ExportConfigurationUseCase(
        provider.resolve<ConfigurationManagementService>(
          InfrastructureTokens.ConfigurationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.ConfigurationManagementImportConfigurationUseCase,
    (provider) =>
      new ImportConfigurationUseCase(
        provider.resolve<ConfigurationManagementService>(
          InfrastructureTokens.ConfigurationManagementService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.ConfigurationManagementApplicationService,
    (provider) =>
      new ConfigurationManagementApplicationService(
        provider.resolve<RegisterConfigurationUseCase>(
          InfrastructureTokens.ConfigurationManagementRegisterConfigurationUseCase,
        ),
        provider.resolve<GetConfigurationUseCase>(
          InfrastructureTokens.ConfigurationManagementGetConfigurationUseCase,
        ),
        provider.resolve<UpdateConfigurationUseCase>(
          InfrastructureTokens.ConfigurationManagementUpdateConfigurationUseCase,
        ),
        provider.resolve<DeleteConfigurationUseCase>(
          InfrastructureTokens.ConfigurationManagementDeleteConfigurationUseCase,
        ),
        provider.resolve<ListConfigurationsUseCase>(
          InfrastructureTokens.ConfigurationManagementListConfigurationsUseCase,
        ),
        provider.resolve<ConfigurationExistsUseCase>(
          InfrastructureTokens.ConfigurationManagementConfigurationExistsUseCase,
        ),
        provider.resolve<ExportConfigurationUseCase>(
          InfrastructureTokens.ConfigurationManagementExportConfigurationUseCase,
        ),
        provider.resolve<ImportConfigurationUseCase>(
          InfrastructureTokens.ConfigurationManagementImportConfigurationUseCase,
        ),
      ),
  );
}
