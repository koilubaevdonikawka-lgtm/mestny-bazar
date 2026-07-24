import type { SecretMetadata } from "@server/application/secrets-management/models/secret.model";

export interface ISecretValidator {
  validateKey(key: string): void;
  validateValue(value: string): void;
  validateMetadata(metadata: SecretMetadata): void;
}
