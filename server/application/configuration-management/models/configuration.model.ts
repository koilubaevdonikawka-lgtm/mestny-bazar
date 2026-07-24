/** Configuration parameter record — system settings only, no domain data. */
export interface ConfigurationEntry {
  readonly key: string;
  readonly value: string;
  readonly description: string | null;
  readonly encrypted: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterConfigurationInput {
  readonly key: string;
  readonly value: unknown;
  readonly description?: string;
  readonly encrypted?: boolean;
}

export interface UpdateConfigurationInput {
  readonly key: string;
  readonly value: unknown;
  readonly description?: string;
}

export interface ConfigurationValueResult {
  readonly key: string;
  readonly value: unknown;
  readonly description: string | null;
  readonly encrypted: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ListConfigurationsResult {
  readonly items: readonly ConfigurationValueResult[];
  readonly total: number;
}

export interface ConfigurationExistsResult {
  readonly key: string;
  readonly exists: boolean;
}

export interface ExportConfigurationResult {
  readonly format: string;
  readonly payload: string;
  readonly count: number;
}

export interface ImportConfigurationInput {
  readonly payload: string | Readonly<Record<string, unknown>>;
}

export interface ImportConfigurationResult {
  readonly importedCount: number;
  readonly skippedCount: number;
  readonly keys: readonly string[];
}

export function createConfigurationEntry(input: {
  key: string;
  value: string;
  description?: string | null;
  encrypted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}): ConfigurationEntry {
  const now = new Date().toISOString();
  return Object.freeze({
    key: input.key.trim(),
    value: input.value,
    description: input.description?.trim() ?? null,
    encrypted: input.encrypted ?? false,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}

export function toConfigurationValueResult(
  entry: ConfigurationEntry,
  value: unknown,
): ConfigurationValueResult {
  return Object.freeze({
    key: entry.key,
    value,
    description: entry.description,
    encrypted: entry.encrypted,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  });
}
