import type {
  ExportSecretMetadataResult,
  ImportSecretMetadataInput,
  ImportSecretMetadataResult,
  ListSecretsResult,
  RegisterSecretInput,
  Secret,
  SecretExistsResult,
  SecretMetadata,
  UpdateSecretInput,
} from "@server/application/secrets-management/models/secret.model";
import type { SecretsManagementService } from "@server/application/secrets-management/services/secrets-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterSecretUseCase {
  constructor(private readonly secrets: SecretsManagementService) {}

  execute(input: RegisterSecretInput): Promise<UseCaseResult<SecretMetadata>> {
    return this.secrets.registerSecret(input).then(useCaseResult);
  }
}

export class GetSecretUseCase {
  constructor(private readonly secrets: SecretsManagementService) {}

  execute(key: string): Promise<UseCaseResult<Secret | null>> {
    return this.secrets.getSecret(key).then(useCaseResult);
  }
}

export class UpdateSecretUseCase {
  constructor(private readonly secrets: SecretsManagementService) {}

  execute(input: UpdateSecretInput): Promise<UseCaseResult<SecretMetadata>> {
    return this.secrets.updateSecret(input).then(useCaseResult);
  }
}

export class DeleteSecretUseCase {
  constructor(private readonly secrets: SecretsManagementService) {}

  execute(key: string): Promise<UseCaseResult<{ key: string; deleted: boolean }>> {
    return this.secrets.deleteSecret(key).then(useCaseResult);
  }
}

export class SecretExistsUseCase {
  constructor(private readonly secrets: SecretsManagementService) {}

  execute(key: string): Promise<UseCaseResult<SecretExistsResult>> {
    return this.secrets.secretExists(key).then(useCaseResult);
  }
}

export class ListSecretsUseCase {
  constructor(private readonly secrets: SecretsManagementService) {}

  execute(): Promise<UseCaseResult<ListSecretsResult>> {
    return this.secrets.listSecrets().then(useCaseResult);
  }
}

export class ExportSecretMetadataUseCase {
  constructor(private readonly secrets: SecretsManagementService) {}

  execute(): Promise<UseCaseResult<ExportSecretMetadataResult>> {
    return this.secrets.exportSecretMetadata().then(useCaseResult);
  }
}

export class ImportSecretMetadataUseCase {
  constructor(private readonly secrets: SecretsManagementService) {}

  execute(input: ImportSecretMetadataInput): Promise<UseCaseResult<ImportSecretMetadataResult>> {
    return this.secrets.importSecretMetadata(input).then(useCaseResult);
  }
}
