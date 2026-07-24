import type { ISecretEncryptionProvider } from "@server/application/secrets-management/contracts/secret-encryption-provider.contract";

/** No-op encryption provider — stores values as-is for in-memory development. */
export class NoopSecretEncryptionProvider implements ISecretEncryptionProvider {
  async encrypt(plaintext: string): Promise<string> {
    return plaintext;
  }

  async decrypt(ciphertext: string): Promise<string> {
    return ciphertext;
  }
}
