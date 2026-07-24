/** Idempotency record — operation deduplication only, no domain data. */
export interface IdempotencyRecord {
  readonly idempotencyKey: string;
  readonly scope: string;
  readonly status: "pending" | "completed" | "expired";
  readonly resultPayload: string | null;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly completedAt: string | null;
}

export interface RegisterIdempotencyKeyInput {
  readonly idempotencyKey?: string;
  readonly scope?: string;
  readonly ttlSeconds?: number;
}

export interface CheckIdempotencyKeyInput {
  readonly idempotencyKey: string;
  readonly scope?: string;
}

export interface CheckIdempotencyKeyResult {
  readonly exists: boolean;
  readonly expired: boolean;
  readonly status: IdempotencyRecord["status"] | null;
  readonly record: IdempotencyRecord | null;
}

export interface StoreOperationResultInput {
  readonly idempotencyKey: string;
  readonly scope?: string;
  readonly result: unknown;
}

export interface StoreOperationResultOutput {
  readonly idempotencyKey: string;
  readonly scope: string;
  readonly stored: boolean;
}

export interface GetStoredOperationResultInput {
  readonly idempotencyKey: string;
  readonly scope?: string;
}

export interface GetStoredOperationResultOutput {
  readonly found: boolean;
  readonly expired: boolean;
  readonly result: unknown | null;
  readonly record: IdempotencyRecord | null;
}

export interface ExpireIdempotencyKeyInput {
  readonly idempotencyKey: string;
  readonly scope?: string;
}

export interface ExpireIdempotencyKeyOutput {
  readonly idempotencyKey: string;
  readonly scope: string;
  readonly expired: boolean;
}

export interface CleanupExpiredKeysResult {
  readonly removedCount: number;
}

export function createIdempotencyRecord(input: {
  idempotencyKey: string;
  scope?: string;
  status?: IdempotencyRecord["status"];
  resultPayload?: string | null;
  createdAt?: string;
  expiresAt: string;
  completedAt?: string | null;
}): IdempotencyRecord {
  return Object.freeze({
    idempotencyKey: input.idempotencyKey.trim(),
    scope: (input.scope ?? "default").trim(),
    status: input.status ?? "pending",
    resultPayload: input.resultPayload ?? null,
    createdAt: input.createdAt ?? new Date().toISOString(),
    expiresAt: input.expiresAt,
    completedAt: input.completedAt ?? null,
  });
}

export function buildIdempotencyStorageKey(idempotencyKey: string, scope = "default"): string {
  return `${scope.trim()}:${idempotencyKey.trim()}`;
}

export function isIdempotencyRecordExpired(record: IdempotencyRecord, now = Date.now()): boolean {
  if (record.status === "expired") {
    return true;
  }

  const expiresAt = Date.parse(record.expiresAt);
  return !Number.isNaN(expiresAt) && expiresAt <= now;
}
