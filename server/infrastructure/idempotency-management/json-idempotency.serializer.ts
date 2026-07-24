import type { IIdempotencySerializer } from "@server/application/idempotency-management/contracts/idempotency-serializer.contract";

/** JSON serializer for idempotency operation results. */
export class JsonIdempotencySerializer implements IIdempotencySerializer {
  serialize(value: unknown): string {
    return JSON.stringify(value ?? null);
  }

  deserialize<T = unknown>(payload: string): T {
    return JSON.parse(payload) as T;
  }
}
