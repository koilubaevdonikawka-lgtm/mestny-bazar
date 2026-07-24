export interface ICacheExpirationPolicy {
  calculateExpiresAt(ttlSeconds?: number): string | null;
  isExpired(expiresAt: string | null): boolean;
}
