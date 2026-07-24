/**
 * Idempotency Management — prevents duplicate operation execution only.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IIdempotencyExpirationPolicy } from "@server/application/idempotency-management/contracts/idempotency-expiration-policy.contract";
import type { IIdempotencyKeyGenerator } from "@server/application/idempotency-management/contracts/idempotency-key-generator.contract";
import type { IIdempotencyRepository } from "@server/application/idempotency-management/contracts/idempotency-repository.contract";
import type { IIdempotencySerializer } from "@server/application/idempotency-management/contracts/idempotency-serializer.contract";
import {
  createIdempotencyRecord,
  isIdempotencyRecordExpired,
  type CheckIdempotencyKeyInput,
  type CheckIdempotencyKeyResult,
  type CleanupExpiredKeysResult,
  type ExpireIdempotencyKeyInput,
  type ExpireIdempotencyKeyOutput,
  type GetStoredOperationResultInput,
  type GetStoredOperationResultOutput,
  type IdempotencyRecord,
  type RegisterIdempotencyKeyInput,
  type StoreOperationResultInput,
  type StoreOperationResultOutput,
} from "@server/application/idempotency-management/models/idempotency.model";

export class IdempotencyManagementService {
  constructor(
    private readonly repository: IIdempotencyRepository,
    private readonly keyGenerator: IIdempotencyKeyGenerator,
    private readonly expirationPolicy: IIdempotencyExpirationPolicy,
    private readonly serializer: IIdempotencySerializer,
  ) {}

  async registerKey(input: RegisterIdempotencyKeyInput): Promise<IdempotencyRecord> {
    const idempotencyKey = (input.idempotencyKey?.trim() || this.keyGenerator.generate(input.scope)).trim();
    const scope = normalizeScope(input.scope);
    const existing = await this.repository.findByKey(idempotencyKey, scope);

    if (existing && !this.isRecordExpired(existing)) {
      return existing;
    }

    const record = createIdempotencyRecord({
      idempotencyKey,
      scope,
      status: "pending",
      expiresAt: this.expirationPolicy.computeExpiresAt(input.ttlSeconds),
    });

    await this.repository.save(record);
    return record;
  }

  async checkKey(input: CheckIdempotencyKeyInput): Promise<CheckIdempotencyKeyResult> {
    const record = await this.repository.findByKey(input.idempotencyKey, input.scope);
    if (!record) {
      return Object.freeze({
        exists: false,
        expired: false,
        status: null,
        record: null,
      });
    }

    const expired = this.isRecordExpired(record);
    return Object.freeze({
      exists: true,
      expired,
      status: expired ? "expired" : record.status,
      record: expired ? await this.markExpired(record) : record,
    });
  }

  async storeResult(input: StoreOperationResultInput): Promise<StoreOperationResultOutput> {
    const scope = normalizeScope(input.scope);
    const record = await this.repository.findByKey(input.idempotencyKey, scope);

    if (!record) {
      throw new Error(`Idempotency key not found: ${input.idempotencyKey}`);
    }

    if (this.isRecordExpired(record)) {
      throw new Error(`Idempotency key expired: ${input.idempotencyKey}`);
    }

    const updated = createIdempotencyRecord({
      ...record,
      status: "completed",
      resultPayload: this.serializer.serialize(input.result),
      completedAt: new Date().toISOString(),
    });

    await this.repository.save(updated);

    return Object.freeze({
      idempotencyKey: updated.idempotencyKey,
      scope: updated.scope,
      stored: true,
    });
  }

  async getStoredResult(input: GetStoredOperationResultInput): Promise<GetStoredOperationResultOutput> {
    const record = await this.repository.findByKey(input.idempotencyKey, input.scope);
    if (!record) {
      return Object.freeze({
        found: false,
        expired: false,
        result: null,
        record: null,
      });
    }

    const expired = this.isRecordExpired(record);
    const effectiveRecord = expired ? await this.markExpired(record) : record;

    return Object.freeze({
      found: effectiveRecord.status === "completed" && !expired,
      expired,
      result:
        effectiveRecord.resultPayload !== null
          ? this.serializer.deserialize(effectiveRecord.resultPayload)
          : null,
      record: effectiveRecord,
    });
  }

  async expireKey(input: ExpireIdempotencyKeyInput): Promise<ExpireIdempotencyKeyOutput> {
    const scope = normalizeScope(input.scope);
    const record = await this.repository.findByKey(input.idempotencyKey, scope);

    if (!record) {
      throw new Error(`Idempotency key not found: ${input.idempotencyKey}`);
    }

    await this.markExpired(record);

    return Object.freeze({
      idempotencyKey: record.idempotencyKey,
      scope,
      expired: true,
    });
  }

  async cleanupExpiredKeys(): Promise<CleanupExpiredKeysResult> {
    const records = await this.repository.findAll();
    let removedCount = 0;

    for (const record of records) {
      if (this.isRecordExpired(record)) {
        await this.repository.delete(record.idempotencyKey, record.scope);
        removedCount += 1;
      }
    }

    return Object.freeze({ removedCount });
  }

  private isRecordExpired(record: IdempotencyRecord): boolean {
    return (
      isIdempotencyRecordExpired(record) ||
      this.expirationPolicy.isExpired(record.expiresAt)
    );
  }

  private async markExpired(record: IdempotencyRecord): Promise<IdempotencyRecord> {
    const expiredRecord = createIdempotencyRecord({
      ...record,
      status: "expired",
    });
    await this.repository.save(expiredRecord);
    return expiredRecord;
  }
}

function normalizeScope(scope?: string): string {
  return (scope?.trim() || "default").trim();
}
