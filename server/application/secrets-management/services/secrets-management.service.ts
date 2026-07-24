/**
 * Secrets Management — secure secret storage and retrieval only.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ISecretEncryptionProvider } from "@server/application/secrets-management/contracts/secret-encryption-provider.contract";
import type { ISecretImportExportProvider } from "@server/application/secrets-management/contracts/secret-import-export-provider.contract";
import type { ISecretRepository } from "@server/application/secrets-management/contracts/secret-repository.contract";
import type { ISecretValidator } from "@server/application/secrets-management/contracts/secret-validator.contract";
import {
  createStoredSecretEntry,
  toSecret,
  toSecretMetadata,
  type ExportSecretMetadataResult,
  type ImportSecretMetadataInput,
  type ImportSecretMetadataResult,
  type ListSecretsResult,
  type RegisterSecretInput,
  type Secret,
  type SecretExistsResult,
  type SecretMetadata,
  type UpdateSecretInput,
} from "@server/application/secrets-management/models/secret.model";
import type { IIdGenerator } from "@server/application/ports";

export class SecretsManagementService {
  constructor(
    private readonly secretRepository: ISecretRepository,
    private readonly encryptionProvider: ISecretEncryptionProvider,
    private readonly validator: ISecretValidator,
    private readonly importExportProvider: ISecretImportExportProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerSecret(input: RegisterSecretInput): Promise<SecretMetadata> {
    const key = input.key.trim();
    this.validator.validateKey(key);
    this.validator.validateValue(input.value);

    if (await this.secretRepository.exists(key)) {
      throw new Error(`Secret already exists: ${key}`);
    }

    const entry = createStoredSecretEntry({
      secretId: this.idGenerator.generate(),
      key,
      encryptedValue: await this.encryptionProvider.encrypt(input.value),
      description: input.description,
      tags: input.tags,
    });

    await this.secretRepository.save(entry);
    return toSecretMetadata(entry);
  }

  async getSecret(key: string): Promise<Secret | null> {
    const entry = await this.secretRepository.findByKey(key.trim());
    if (!entry) {
      return null;
    }

    const value = await this.encryptionProvider.decrypt(entry.encryptedValue);
    return toSecret(entry, value);
  }

  async updateSecret(input: UpdateSecretInput): Promise<SecretMetadata> {
    const key = input.key.trim();
    this.validator.validateKey(key);
    this.validator.validateValue(input.value);

    const existing = await this.secretRepository.findByKey(key);
    if (!existing) {
      throw new Error(`Secret not found: ${key}`);
    }

    const updated = createStoredSecretEntry({
      secretId: existing.secretId,
      key: existing.key,
      encryptedValue: await this.encryptionProvider.encrypt(input.value),
      description: input.description ?? existing.description,
      tags: input.tags ?? existing.tags,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.secretRepository.save(updated);
    return toSecretMetadata(updated);
  }

  async deleteSecret(key: string): Promise<{ key: string; deleted: boolean }> {
    const normalizedKey = key.trim();
    if (!(await this.secretRepository.findByKey(normalizedKey))) {
      throw new Error(`Secret not found: ${normalizedKey}`);
    }

    await this.secretRepository.delete(normalizedKey);
    return Object.freeze({ key: normalizedKey, deleted: true });
  }

  async secretExists(key: string): Promise<SecretExistsResult> {
    const normalizedKey = key.trim();
    return Object.freeze({
      key: normalizedKey,
      exists: await this.secretRepository.exists(normalizedKey),
    });
  }

  async listSecrets(): Promise<ListSecretsResult> {
    const entries = await this.secretRepository.findAll();
    const secrets = Object.freeze(
      [...entries]
        .map(toSecretMetadata)
        .sort((left, right) => left.key.localeCompare(right.key)),
    );

    return Object.freeze({
      secrets,
      total: secrets.length,
    });
  }

  async exportSecretMetadata(): Promise<ExportSecretMetadataResult> {
    const { secrets } = await this.listSecrets();
    const payload = await this.importExportProvider.exportMetadata(secrets);

    return Object.freeze({
      format: "json",
      payload,
      count: secrets.length,
    });
  }

  async importSecretMetadata(input: ImportSecretMetadataInput): Promise<ImportSecretMetadataResult> {
    const metadataList = await this.importExportProvider.importMetadata(input.payload.trim());
    let importedCount = 0;
    let skippedCount = 0;

    for (const metadata of metadataList) {
      this.validator.validateMetadata(metadata);

      if (await this.secretRepository.exists(metadata.key)) {
        skippedCount += 1;
        continue;
      }

      const placeholder = createStoredSecretEntry({
        secretId: metadata.secretId || this.idGenerator.generate(),
        key: metadata.key,
        encryptedValue: await this.encryptionProvider.encrypt(""),
        description: metadata.description,
        tags: metadata.tags,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
      });

      await this.secretRepository.save(placeholder);
      importedCount += 1;
    }

    return Object.freeze({ importedCount, skippedCount });
  }
}
