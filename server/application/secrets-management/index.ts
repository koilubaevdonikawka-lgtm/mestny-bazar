export type { ISecretRepository } from "./contracts/secret-repository.contract";
export type { ISecretEncryptionProvider } from "./contracts/secret-encryption-provider.contract";
export type { ISecretSerializer } from "./contracts/secret-serializer.contract";
export type { ISecretValidator } from "./contracts/secret-validator.contract";
export type { ISecretImportExportProvider } from "./contracts/secret-import-export-provider.contract";
export type {
  IVaultProvider,
  IAwsSecretsManagerProvider,
  IAzureKeyVaultProvider,
  IGoogleSecretManagerProvider,
  ISecretRotationProvider,
} from "./contracts/secrets-extension-ports.contract";
export {
  createStoredSecretEntry,
  toSecret,
  toSecretMetadata,
} from "./models/secret.model";
export type {
  Secret,
  SecretMetadata,
  StoredSecretEntry,
  RegisterSecretInput,
  UpdateSecretInput,
  ListSecretsResult,
  SecretExistsResult,
  ExportSecretMetadataResult,
  ImportSecretMetadataInput,
  ImportSecretMetadataResult,
} from "./models/secret.model";
export { SecretsManagementService } from "./services/secrets-management.service";
export { SecretsManagementApplicationService } from "./services/secrets-management-application.service";
export {
  RegisterSecretUseCase,
  GetSecretUseCase,
  UpdateSecretUseCase,
  DeleteSecretUseCase,
  SecretExistsUseCase,
  ListSecretsUseCase,
  ExportSecretMetadataUseCase,
  ImportSecretMetadataUseCase,
} from "./use-cases/secrets-management.use-cases";
