import type { ISecretEncryptionProvider } from "@server/application/secrets-management/contracts/secret-encryption-provider.contract";
import type { ISecretImportExportProvider } from "@server/application/secrets-management/contracts/secret-import-export-provider.contract";
import type { ISecretRepository } from "@server/application/secrets-management/contracts/secret-repository.contract";
import type { ISecretValidator } from "@server/application/secrets-management/contracts/secret-validator.contract";
import {
  DeleteSecretUseCase,
  ExportSecretMetadataUseCase,
  GetSecretUseCase,
  ImportSecretMetadataUseCase,
  ListSecretsUseCase,
  RegisterSecretUseCase,
  SecretExistsUseCase,
  SecretsManagementApplicationService,
  SecretsManagementService,
  UpdateSecretUseCase,
} from "@server/application/secrets-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultSecretImportExportProvider } from "@server/infrastructure/secrets-management/default-secret-import-export.provider";
import { DefaultSecretValidator } from "@server/infrastructure/secrets-management/default-secret.validator";
import { JsonSecretSerializer } from "@server/infrastructure/secrets-management/json-secret.serializer";
import { NoopSecretEncryptionProvider } from "@server/infrastructure/secrets-management/noop-secret-encryption.provider";
import { SecretRepository } from "@server/infrastructure/secrets-management/secret.repository";

/** Registers secrets management services and use cases. */
export function registerSecretsManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.SecretsManagementSecretRepository, () =>
    new SecretRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.SecretsManagementSecretEncryptionProvider, () =>
    new NoopSecretEncryptionProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.SecretsManagementSecretSerializer, () =>
    new JsonSecretSerializer(),
  );

  registry.registerSingleton(InfrastructureTokens.SecretsManagementSecretValidator, () =>
    new DefaultSecretValidator(),
  );

  registry.registerSingleton(InfrastructureTokens.SecretsManagementSecretImportExportProvider, () =>
    new DefaultSecretImportExportProvider(),
  );

  registry.registerTransient(InfrastructureTokens.SecretsManagementService, (provider) =>
    new SecretsManagementService(
      provider.resolve<ISecretRepository>(InfrastructureTokens.SecretsManagementSecretRepository),
      provider.resolve<ISecretEncryptionProvider>(
        InfrastructureTokens.SecretsManagementSecretEncryptionProvider,
      ),
      provider.resolve<ISecretValidator>(InfrastructureTokens.SecretsManagementSecretValidator),
      provider.resolve<ISecretImportExportProvider>(
        InfrastructureTokens.SecretsManagementSecretImportExportProvider,
      ),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.SecretsManagementRegisterSecretUseCase,
    (provider) =>
      new RegisterSecretUseCase(
        provider.resolve<SecretsManagementService>(InfrastructureTokens.SecretsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.SecretsManagementGetSecretUseCase,
    (provider) =>
      new GetSecretUseCase(
        provider.resolve<SecretsManagementService>(InfrastructureTokens.SecretsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.SecretsManagementUpdateSecretUseCase,
    (provider) =>
      new UpdateSecretUseCase(
        provider.resolve<SecretsManagementService>(InfrastructureTokens.SecretsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.SecretsManagementDeleteSecretUseCase,
    (provider) =>
      new DeleteSecretUseCase(
        provider.resolve<SecretsManagementService>(InfrastructureTokens.SecretsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.SecretsManagementSecretExistsUseCase,
    (provider) =>
      new SecretExistsUseCase(
        provider.resolve<SecretsManagementService>(InfrastructureTokens.SecretsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.SecretsManagementListSecretsUseCase,
    (provider) =>
      new ListSecretsUseCase(
        provider.resolve<SecretsManagementService>(InfrastructureTokens.SecretsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.SecretsManagementExportSecretMetadataUseCase,
    (provider) =>
      new ExportSecretMetadataUseCase(
        provider.resolve<SecretsManagementService>(InfrastructureTokens.SecretsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.SecretsManagementImportSecretMetadataUseCase,
    (provider) =>
      new ImportSecretMetadataUseCase(
        provider.resolve<SecretsManagementService>(InfrastructureTokens.SecretsManagementService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.SecretsManagementApplicationService,
    (provider) =>
      new SecretsManagementApplicationService(
        provider.resolve<RegisterSecretUseCase>(
          InfrastructureTokens.SecretsManagementRegisterSecretUseCase,
        ),
        provider.resolve<GetSecretUseCase>(InfrastructureTokens.SecretsManagementGetSecretUseCase),
        provider.resolve<UpdateSecretUseCase>(
          InfrastructureTokens.SecretsManagementUpdateSecretUseCase,
        ),
        provider.resolve<DeleteSecretUseCase>(
          InfrastructureTokens.SecretsManagementDeleteSecretUseCase,
        ),
        provider.resolve<SecretExistsUseCase>(
          InfrastructureTokens.SecretsManagementSecretExistsUseCase,
        ),
        provider.resolve<ListSecretsUseCase>(
          InfrastructureTokens.SecretsManagementListSecretsUseCase,
        ),
        provider.resolve<ExportSecretMetadataUseCase>(
          InfrastructureTokens.SecretsManagementExportSecretMetadataUseCase,
        ),
        provider.resolve<ImportSecretMetadataUseCase>(
          InfrastructureTokens.SecretsManagementImportSecretMetadataUseCase,
        ),
      ),
  );
}
