import { buildCompositionRoot } from "@server/bootstrap/composition-root";
import type { ServiceProvider } from "@server/infrastructure/di/service-container";

let cachedProvider: ServiceProvider | undefined;

/** Lazy singleton for resolving bootstrap-layer services from server functions. */
export function getApplicationProvider(): ServiceProvider {
  if (!cachedProvider) {
    cachedProvider = buildCompositionRoot().provider;
  }
  return cachedProvider;
}

/** Clears cached provider — intended for tests. */
export function resetApplicationProvider(): void {
  cachedProvider = undefined;
}
