/** Secret metadata — no secret values exposed. */
export interface SecretMetadata {
  readonly secretId: string;
  readonly key: string;
  readonly description: string;
  readonly tags: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Stored secret entry with encrypted value. */
export interface StoredSecretEntry {
  readonly secretId: string;
  readonly key: string;
  readonly encryptedValue: string;
  readonly description: string;
  readonly tags: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Secret with decrypted value — returned on get only. */
export interface Secret {
  readonly secretId: string;
  readonly key: string;
  readonly value: string;
  readonly description: string;
  readonly tags: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterSecretInput {
  readonly key: string;
  readonly value: string;
  readonly description?: string;
  readonly tags?: Readonly<Record<string, string>>;
}

export interface UpdateSecretInput {
  readonly key: string;
  readonly value: string;
  readonly description?: string;
  readonly tags?: Readonly<Record<string, string>>;
}

export interface ListSecretsResult {
  readonly secrets: readonly SecretMetadata[];
  readonly total: number;
}

export interface SecretExistsResult {
  readonly key: string;
  readonly exists: boolean;
}

export interface ExportSecretMetadataResult {
  readonly format: string;
  readonly payload: string;
  readonly count: number;
}

export interface ImportSecretMetadataInput {
  readonly payload: string;
}

export interface ImportSecretMetadataResult {
  readonly importedCount: number;
  readonly skippedCount: number;
}

export function createStoredSecretEntry(input: {
  secretId: string;
  key: string;
  encryptedValue: string;
  description?: string;
  tags?: Readonly<Record<string, string>>;
  createdAt?: string;
  updatedAt?: string;
}): StoredSecretEntry {
  const now = new Date().toISOString();
  return Object.freeze({
    secretId: input.secretId.trim(),
    key: input.key.trim(),
    encryptedValue: input.encryptedValue,
    description: (input.description ?? "").trim(),
    tags: Object.freeze({ ...(input.tags ?? {}) }),
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}

export function toSecretMetadata(entry: StoredSecretEntry): SecretMetadata {
  return Object.freeze({
    secretId: entry.secretId,
    key: entry.key,
    description: entry.description,
    tags: entry.tags,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  });
}

export function toSecret(entry: StoredSecretEntry, value: string): Secret {
  return Object.freeze({
    secretId: entry.secretId,
    key: entry.key,
    value,
    description: entry.description,
    tags: entry.tags,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  });
}
