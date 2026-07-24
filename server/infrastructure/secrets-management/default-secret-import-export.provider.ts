import type { ISecretImportExportProvider } from "@server/application/secrets-management/contracts/secret-import-export-provider.contract";
import type { SecretMetadata } from "@server/application/secrets-management/models/secret.model";

/** Default metadata import/export provider — JSON format, no secret values. */
export class DefaultSecretImportExportProvider implements ISecretImportExportProvider {
  async exportMetadata(metadata: readonly SecretMetadata[]): Promise<string> {
    return JSON.stringify(metadata, null, 2);
  }

  async importMetadata(payload: string): Promise<readonly SecretMetadata[]> {
    const parsed = JSON.parse(payload) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error("Import payload must be a JSON array of secret metadata.");
    }

    return Object.freeze(
      parsed.map((entry) => {
        const item = entry as Partial<SecretMetadata>;
        return Object.freeze({
          secretId: String(item.secretId ?? "").trim(),
          key: String(item.key ?? "").trim(),
          description: String(item.description ?? "").trim(),
          tags: Object.freeze({ ...(item.tags ?? {}) }),
          createdAt: String(item.createdAt ?? new Date().toISOString()),
          updatedAt: String(item.updatedAt ?? new Date().toISOString()),
        });
      }),
    );
  }
}
