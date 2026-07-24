import type { IIdempotencyExpirationPolicy } from "@server/application/idempotency-management/contracts/idempotency-expiration-policy.contract";

/** Default in-memory idempotency expiration policy. */
export class DefaultIdempotencyExpirationPolicy implements IIdempotencyExpirationPolicy {
  constructor(private readonly defaultTtlSeconds = 24 * 60 * 60) {}

  getDefaultTtlSeconds(): number {
    return this.defaultTtlSeconds;
  }

  computeExpiresAt(ttlSeconds?: number, createdAt?: string): string {
    const ttl = ttlSeconds ?? this.defaultTtlSeconds;
    const baseTime = createdAt ? Date.parse(createdAt) : Date.now();
    return new Date(baseTime + ttl * 1000).toISOString();
  }

  isExpired(expiresAt: string, now = Date.now()): boolean {
    const expiresAtTime = Date.parse(expiresAt);
    return Number.isNaN(expiresAtTime) || expiresAtTime <= now;
  }
}
