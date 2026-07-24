import type { IAnalyticsCacheProvider } from "@server/application/analytics-management/contracts/analytics-cache-provider.contract";

/** No-op cache provider — in-memory caching disabled until external cache is connected. */
export class NoopAnalyticsCacheProvider implements IAnalyticsCacheProvider {
  async get<T>(_key: string): Promise<T | null> {
    return null;
  }

  async set<T>(_key: string, _value: T, _ttlSeconds?: number): Promise<void> {
    // Reserved for Redis or external cache integration.
  }

  async invalidate(_key: string): Promise<void> {
    // Reserved for Redis or external cache integration.
  }
}
