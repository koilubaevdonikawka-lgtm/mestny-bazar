/**
 * Future integration ports for Secrets Management.
 * Not implemented — reserved for external secret stores.
 */

import type {
  Secret,
  SecretMetadata,
} from "@server/application/secrets-management/models/secret.model";

/** HashiCorp Vault Provider — Vault integration. */
export interface IVaultProvider {
  writeSecret(key: string, value: string): Promise<void>;
  readSecret(key: string): Promise<Secret | null>;
  deleteSecret(key: string): Promise<void>;
}

/** AWS Secrets Manager Provider — AWS integration. */
export interface IAwsSecretsManagerProvider {
  createSecret(key: string, value: string): Promise<void>;
  getSecretValue(key: string): Promise<Secret | null>;
  deleteSecret(key: string): Promise<void>;
}

/** Azure Key Vault Provider — Azure integration. */
export interface IAzureKeyVaultProvider {
  setSecret(key: string, value: string): Promise<void>;
  getSecret(key: string): Promise<Secret | null>;
  deleteSecret(key: string): Promise<void>;
}

/** Google Secret Manager Provider — GCP integration. */
export interface IGoogleSecretManagerProvider {
  addSecretVersion(key: string, value: string): Promise<void>;
  accessSecretVersion(key: string): Promise<Secret | null>;
  deleteSecret(key: string): Promise<void>;
}

/** Secret Rotation Provider — automated secret rotation. */
export interface ISecretRotationProvider {
  rotateSecret(key: string): Promise<Secret>;
  listRotatableSecrets(): Promise<readonly SecretMetadata[]>;
}
