/**
 * Configuration Management — system parameter storage only.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IConfigurationEncryptionProvider } from "@server/application/configuration-management/contracts/configuration-encryption-provider.contract";
import type { IConfigurationImportExportProvider } from "@server/application/configuration-management/contracts/configuration-import-export-provider.contract";
import type { IConfigurationRepository } from "@server/application/configuration-management/contracts/configuration-repository.contract";
import type { IConfigurationSerializer } from "@server/application/configuration-management/contracts/configuration-serializer.contract";
import type { IConfigurationValidator } from "@server/application/configuration-management/contracts/configuration-validator.contract";
import {
  createConfigurationEntry,
  toConfigurationValueResult,
  type ConfigurationExistsResult,
  type ConfigurationValueResult,
  type ExportConfigurationResult,
  type ImportConfigurationInput,
  type ImportConfigurationResult,
  type ListConfigurationsResult,
  type RegisterConfigurationInput,
  type UpdateConfigurationInput,
} from "@server/application/configuration-management/models/configuration.model";

export class ConfigurationManagementService {
  constructor(
    private readonly repository: IConfigurationRepository,
    private readonly serializer: IConfigurationSerializer,
    private readonly validator: IConfigurationValidator,
    private readonly encryptionProvider: IConfigurationEncryptionProvider,
    private readonly importExportProvider: IConfigurationImportExportProvider,
  ) {}

  async register(input: RegisterConfigurationInput): Promise<ConfigurationValueResult> {
    this.assertValidKey(input.key);
    this.assertValidValue(input.value);

    const key = input.key.trim();
    if (await this.repository.exists(key)) {
      throw new Error(`Configuration key already exists: ${key}`);
    }

    const storedValue = await this.prepareStoredValue(input.value, input.encrypted ?? false);
    const entry = createConfigurationEntry({
      key,
      value: storedValue,
      description: input.description,
      encrypted: input.encrypted ?? false,
    });

    await this.repository.save(entry);
    return toConfigurationValueResult(entry, input.value);
  }

  async get(key: string): Promise<ConfigurationValueResult | null> {
    const entry = await this.repository.findByKey(key.trim());
    if (!entry) {
      return null;
    }

    const value = await this.resolveValue(entry);
    return toConfigurationValueResult(entry, value);
  }

  async update(input: UpdateConfigurationInput): Promise<ConfigurationValueResult> {
    this.assertValidKey(input.key);
    this.assertValidValue(input.value);

    const key = input.key.trim();
    const existing = await this.repository.findByKey(key);
    if (!existing) {
      throw new Error(`Configuration key not found: ${key}`);
    }

    const storedValue = await this.prepareStoredValue(input.value, existing.encrypted);
    const entry = createConfigurationEntry({
      key,
      value: storedValue,
      description: input.description ?? existing.description,
      encrypted: existing.encrypted,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.repository.save(entry);
    return toConfigurationValueResult(entry, input.value);
  }

  async delete(key: string): Promise<{ key: string; deleted: boolean }> {
    const normalizedKey = key.trim();
    if (!(await this.repository.exists(normalizedKey))) {
      throw new Error(`Configuration key not found: ${normalizedKey}`);
    }

    await this.repository.delete(normalizedKey);
    return Object.freeze({ key: normalizedKey, deleted: true });
  }

  async list(): Promise<ListConfigurationsResult> {
    const entries = await this.repository.findAll();
    const items = await Promise.all(
      entries.map(async (entry) => toConfigurationValueResult(entry, await this.resolveValue(entry))),
    );

    return Object.freeze({
      items: Object.freeze(items.sort((left, right) => left.key.localeCompare(right.key))),
      total: items.length,
    });
  }

  async exists(key: string): Promise<ConfigurationExistsResult> {
    const normalizedKey = key.trim();
    return Object.freeze({
      key: normalizedKey,
      exists: await this.repository.exists(normalizedKey),
    });
  }

  async exportConfiguration(): Promise<ExportConfigurationResult> {
    const entries = await this.repository.findAll();
    const items = await Promise.all(
      entries.map(async (entry) =>
        Object.freeze({
          key: entry.key,
          value: await this.resolveValue(entry),
          description: entry.description,
          encrypted: entry.encrypted,
        }),
      ),
    );
    const payload = await this.importExportProvider.export(items);

    return Object.freeze({
      format: "json",
      payload,
      count: items.length,
    });
  }

  async importConfiguration(input: ImportConfigurationInput): Promise<ImportConfigurationResult> {
    const items = await this.importExportProvider.parseImport(input.payload);
    const keys: string[] = [];
    let importedCount = 0;
    let skippedCount = 0;

    for (const item of items) {
      const keyValidation = this.validator.validateKey(item.key);
      const valueValidation = this.validator.validateValue(item.value);

      if (!keyValidation.valid || !valueValidation.valid) {
        skippedCount += 1;
        continue;
      }

      const key = item.key.trim();
      const storedValue = await this.prepareStoredValue(item.value, item.encrypted ?? false);
      const existing = await this.repository.findByKey(key);
      const entry = createConfigurationEntry({
        key,
        value: storedValue,
        description: item.description,
        encrypted: item.encrypted ?? false,
        createdAt: existing?.createdAt,
      });

      await this.repository.save(entry);
      keys.push(key);
      importedCount += 1;
    }

    return Object.freeze({
      importedCount,
      skippedCount,
      keys: Object.freeze(keys),
    });
  }

  private async prepareStoredValue(value: unknown, encrypted: boolean): Promise<string> {
    const serialized = this.serializer.serialize(value);
    if (!encrypted) {
      return serialized;
    }

    return this.encryptionProvider.encrypt(serialized);
  }

  private async resolveValue(entry: { value: string; encrypted: boolean }): Promise<unknown> {
    const payload = entry.encrypted
      ? await this.encryptionProvider.decrypt(entry.value)
      : entry.value;

    return this.serializer.deserialize(payload);
  }

  private assertValidKey(key: string): void {
    const result = this.validator.validateKey(key);
    if (!result.valid) {
      throw new Error(result.errors.join("; "));
    }
  }

  private assertValidValue(value: unknown): void {
    const result = this.validator.validateValue(value);
    if (!result.valid) {
      throw new Error(result.errors.join("; "));
    }
  }
}
