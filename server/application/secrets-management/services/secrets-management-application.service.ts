import type {
  ImportSecretMetadataInput,
  RegisterSecretInput,
  UpdateSecretInput,
} from "@server/application/secrets-management/models/secret.model";
import {
  DeleteSecretUseCase,
  ExportSecretMetadataUseCase,
  GetSecretUseCase,
  ImportSecretMetadataUseCase,
  ListSecretsUseCase,
  RegisterSecretUseCase,
  SecretExistsUseCase,
  UpdateSecretUseCase,
} from "@server/application/secrets-management/use-cases/secrets-management.use-cases";

/** Application facade for secrets management scenario. */
export class SecretsManagementApplicationService {
  constructor(
    private readonly registerSecretUseCase: RegisterSecretUseCase,
    private readonly getSecretUseCase: GetSecretUseCase,
    private readonly updateSecretUseCase: UpdateSecretUseCase,
    private readonly deleteSecretUseCase: DeleteSecretUseCase,
    private readonly secretExistsUseCase: SecretExistsUseCase,
    private readonly listSecretsUseCase: ListSecretsUseCase,
    private readonly exportSecretMetadataUseCase: ExportSecretMetadataUseCase,
    private readonly importSecretMetadataUseCase: ImportSecretMetadataUseCase,
  ) {}

  registerSecret(input: RegisterSecretInput) {
    return this.registerSecretUseCase.execute(input);
  }

  getSecret(key: string) {
    return this.getSecretUseCase.execute(key);
  }

  updateSecret(input: UpdateSecretInput) {
    return this.updateSecretUseCase.execute(input);
  }

  deleteSecret(key: string) {
    return this.deleteSecretUseCase.execute(key);
  }

  secretExists(key: string) {
    return this.secretExistsUseCase.execute(key);
  }

  listSecrets() {
    return this.listSecretsUseCase.execute();
  }

  exportSecretMetadata() {
    return this.exportSecretMetadataUseCase.execute();
  }

  importSecretMetadata(input: ImportSecretMetadataInput) {
    return this.importSecretMetadataUseCase.execute(input);
  }
}
