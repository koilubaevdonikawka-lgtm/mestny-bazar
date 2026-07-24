import type { IIdempotencyRepository } from "@server/application/idempotency-management/contracts/idempotency-repository.contract";
import type { IIdempotencyStorage } from "@server/application/idempotency-management/contracts/idempotency-storage.contract";
import {
  buildIdempotencyStorageKey,
  type IdempotencyRecord,
} from "@server/application/idempotency-management/models/idempotency.model";

/** Idempotency repository backed by in-memory storage. */
export class IdempotencyRepository implements IIdempotencyRepository {
  constructor(private readonly storage: IIdempotencyStorage) {}

  async save(record: IdempotencyRecord): Promise<void> {
    await this.storage.set(buildIdempotencyStorageKey(record.idempotencyKey, record.scope), record);
  }

  async findByKey(idempotencyKey: string, scope = "default"): Promise<IdempotencyRecord | null> {
    return this.storage.get(buildIdempotencyStorageKey(idempotencyKey, scope));
  }

  async delete(idempotencyKey: string, scope = "default"): Promise<void> {
    await this.storage.delete(buildIdempotencyStorageKey(idempotencyKey, scope));
  }

  async findAll(): Promise<readonly IdempotencyRecord[]> {
    const keys = await this.storage.listKeys();
    const records: IdempotencyRecord[] = [];

    for (const key of keys) {
      const record = await this.storage.get(key);
      if (record) {
        records.push(record);
      }
    }

    return Object.freeze(records);
  }
}
