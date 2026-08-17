/**
 * Memoizes an async factory, but clears the cache on rejection so the next
 * call retries instead of reusing the same dead promise forever.
 *
 * A plain `if (!cached) cached = factory()` caches a REJECTED promise
 * permanently the first time factory() fails — a promise is truthy
 * regardless of its resolution state, so every subsequent call would return
 * that same rejected promise with no way to recover short of restarting the
 * process. This is exactly the class of bug src/server.ts's getServerEntry()
 * had (contrast with server/di/container.ts's getServices(), which only
 * assigns its cache variable AFTER a successful synchronous return, so a
 * throw there already retries correctly on the next call).
 */
export function createRetryableLazy<T>(factory: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | undefined;

  return () => {
    if (!cached) {
      cached = factory().catch((error: unknown) => {
        cached = undefined;
        throw error;
      });
    }
    return cached;
  };
}
