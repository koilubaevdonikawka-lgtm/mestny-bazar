import type { IdempotencyRecord } from "@server/application/idempotency-management/models/idempotency.model";

export interface IIdempotencyRepository {
  save(record: IdempotencyRecord): Promise<void>;
  findByKey(idempotencyKey: string, scope?: string): Promise<IdempotencyRecord | null>;
  delete(idempotencyKey: string, scope?: string): Promise<void>;
  findAll(): Promise<readonly IdempotencyRecord[]>;
}
