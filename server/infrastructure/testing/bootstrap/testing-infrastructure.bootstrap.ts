import {
  createServiceRegistry,
  type CompositionRootConfig,
} from "@server/bootstrap/composition-root";
import { activateIntegrationProviders } from "@server/infrastructure/integration/bootstrap";
import { activateAnalyticsEventSubscriptions } from "@server/infrastructure/analytics/bootstrap/analytics-event-wiring.bootstrap";
import { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  TestingPlatform,
  TestingTokens,
} from "@server/platform/testing/testing";

export type TestingPersistence = "memory" | "supabase";
export type TestingProviderDriver = "noop" | "finik" | "telegram" | "local" | "supabase";

export interface TestingBootstrapConfig extends CompositionRootConfig {
  readonly persistence?: TestingPersistence;
  readonly paymentProvider?: "noop" | "finik";
  readonly notificationProvider?: "noop" | "telegram";
  readonly storageProvider?: "noop" | "local" | "supabase";
}

export const DEFAULT_TESTING_CONFIG: TestingBootstrapConfig = Object.freeze({
  persistence: "memory",
  paymentProvider: "noop",
  notificationProvider: "noop",
  storageProvider: "noop",
});

/** Creates an isolated testing platform with in-memory or stub providers by default. */
export function createTestingPlatform(
  config: TestingBootstrapConfig = DEFAULT_TESTING_CONFIG,
): TestingPlatform {
  const registry = createServiceRegistry({
    ...DEFAULT_TESTING_CONFIG,
    ...config,
  });
  const provider = new ServiceProvider(registry);
  activateIntegrationProviders(provider);
  activateAnalyticsEventSubscriptions(provider);
  return provider.resolve<TestingPlatform>(TestingTokens.TestingPlatform);
}

/** Creates a testing platform configured for Supabase persistence. */
export function createSupabaseTestingPlatform(
  config: Omit<TestingBootstrapConfig, "persistence"> = {},
): TestingPlatform {
  return createTestingPlatform({
    ...config,
    persistence: "supabase",
  });
}

/** Creates a testing platform with stub/noop external providers. */
export function createStubTestingPlatform(
  config: Omit<TestingBootstrapConfig, "paymentProvider" | "notificationProvider" | "storageProvider"> = {},
): TestingPlatform {
  return createTestingPlatform({
    ...DEFAULT_TESTING_CONFIG,
    ...config,
  });
}
