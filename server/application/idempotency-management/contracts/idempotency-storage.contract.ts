import type { IdempotencyRecord } from "@server/application/idempotency-management/models/idempotency.model";

export interface IIdempotencyStorage {
  set(storageKey: string, record: IdempotencyRecord): Promise<void>;
  get(storageKey: string): Promise<IdempotencyRecord | null>;
  delete(storageKey: string): Promise<void>;
  listKeys(): Promise<readonly string[]>;
}
