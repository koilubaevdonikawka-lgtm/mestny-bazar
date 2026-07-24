import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { MemoryAnalyticsStore } from "@server/infrastructure/analytics/memory-analytics.store";
import { SupabaseAnalyticsStore } from "@server/infrastructure/analytics/supabase-analytics.store";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";

/** Registers analytics persistence adapters via existing DI tokens. */
export function registerAnalyticsInfrastructure(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AnalyticsStore,
    () => new MemoryAnalyticsStore(),
  );
}

/** Registers Supabase analytics persistence adapters. */
export function registerSupabaseAnalyticsInfrastructure(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AnalyticsStore,
    (provider) =>
      new SupabaseAnalyticsStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );
}
