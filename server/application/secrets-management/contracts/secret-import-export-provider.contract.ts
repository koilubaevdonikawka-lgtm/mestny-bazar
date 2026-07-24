import type { SecretMetadata } from "@server/application/secrets-management/models/secret.model";

export interface ISecretImportExportProvider {
  exportMetadata(metadata: readonly SecretMetadata[]): Promise<string>;
  importMetadata(payload: string): Promise<readonly SecretMetadata[]>;
}
