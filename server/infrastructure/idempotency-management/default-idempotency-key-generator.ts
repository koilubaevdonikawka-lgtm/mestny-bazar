import { randomBytes } from "node:crypto";
import type { IIdempotencyKeyGenerator } from "@server/application/idempotency-management/contracts/idempotency-key-generator.contract";

/** Default opaque idempotency key generator. */
export class DefaultIdempotencyKeyGenerator implements IIdempotencyKeyGenerator {
  generate(_scope?: string): string {
    return `idk_${randomBytes(16).toString("base64url")}`;
  }
}
