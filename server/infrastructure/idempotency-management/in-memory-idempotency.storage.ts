import type { IIdempotencyStorage } from "@server/application/idempotency-management/contracts/idempotency-storage.contract";
import type { IdempotencyRecord } from "@server/application/idempotency-management/models/idempotency.model";

/** In-memory idempotency storage. */
export class InMemoryIdempotencyStorage implements IIdempotencyStorage {
  private readonly records = new Map<string, IdempotencyRecord>();

  async set(storageKey: string, record: IdempotencyRecord): Promise<void> {
    this.records.set(storageKey.trim(), record);
  }

  async get(storageKey: string): Promise<IdempotencyRecord | null> {
    return this.records.get(storageKey.trim()) ?? null;
  }

  async delete(storageKey: string): Promise<void> {
    this.records.delete(storageKey.trim());
  }

  async listKeys(): Promise<readonly string[]> {
    return Object.freeze([...this.records.keys()]);
  }
}
