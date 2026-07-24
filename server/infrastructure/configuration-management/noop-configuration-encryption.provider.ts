import type { IConfigurationEncryptionProvider } from "@server/application/configuration-management/contracts/configuration-encryption-provider.contract";

/** No-op encryption provider for future secrets integrations. */
export class NoopConfigurationEncryptionProvider implements IConfigurationEncryptionProvider {
  private readonly prefix = "enc:";

  async encrypt(plainText: string): Promise<string> {
    return `${this.prefix}${Buffer.from(plainText).toString("base64url")}`;
  }

  async decrypt(cipherText: string): Promise<string> {
    if (!this.isEncrypted(cipherText)) {
      return cipherText;
    }

    return Buffer.from(cipherText.slice(this.prefix.length), "base64url").toString("utf8");
  }

  isEncrypted(value: string): boolean {
    return value.startsWith(this.prefix);
  }
}
