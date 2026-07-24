/** Optional analytics result cache — in-memory noop by default. */
export interface IAnalyticsCacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  invalidate(key: string): Promise<void>;
}
