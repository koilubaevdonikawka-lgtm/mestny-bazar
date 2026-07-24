import type { ISecretValidator } from "@server/application/secrets-management/contracts/secret-validator.contract";
import type { SecretMetadata } from "@server/application/secrets-management/models/secret.model";

/** Default secret validator — key and value constraints. */
export class DefaultSecretValidator implements ISecretValidator {
  validateKey(key: string): void {
    const normalizedKey = key.trim();
    if (!normalizedKey) {
      throw new Error("Secret key is required.");
    }
    if (normalizedKey.length > 256) {
      throw new Error("Secret key must not exceed 256 characters.");
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(normalizedKey)) {
      throw new Error("Secret key may only contain letters, numbers, dots, underscores, and hyphens.");
    }
  }

  validateValue(value: string): void {
    if (!value) {
      throw new Error("Secret value is required.");
    }
    if (value.length > 65_536) {
      throw new Error("Secret value must not exceed 65536 characters.");
    }
  }

  validateMetadata(metadata: SecretMetadata): void {
    this.validateKey(metadata.key);
    if (!metadata.secretId.trim()) {
      throw new Error("Secret metadata secretId is required.");
    }
  }
}
