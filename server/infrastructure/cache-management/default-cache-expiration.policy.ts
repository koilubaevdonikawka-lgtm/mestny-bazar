import type { ICacheExpirationPolicy } from "@server/application/cache-management/contracts/cache-expiration-policy.contract";

/** Default TTL expiration policy. */
export class DefaultCacheExpirationPolicy implements ICacheExpirationPolicy {
  calculateExpiresAt(ttlSeconds?: number): string | null {
    if (ttlSeconds === undefined || ttlSeconds === null) {
      return null;
    }
    if (ttlSeconds <= 0) {
      return null;
    }
    return new Date(Date.now() + ttlSeconds * 1000).toISOString();
  }

  isExpired(expiresAt: string | null): boolean {
    if (!expiresAt) {
      return false;
    }
    return Date.parse(expiresAt) <= Date.now();
  }
}
