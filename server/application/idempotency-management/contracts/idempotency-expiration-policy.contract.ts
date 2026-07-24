export interface IIdempotencyExpirationPolicy {
  getDefaultTtlSeconds(): number;
  computeExpiresAt(ttlSeconds?: number, createdAt?: string): string;
  isExpired(expiresAt: string, now?: number): boolean;
}
