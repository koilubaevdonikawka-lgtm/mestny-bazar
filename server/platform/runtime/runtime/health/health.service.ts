import type { IHealthService } from "@server/platform/runtime/runtime/contracts";
import {
  createRuntimeComponentHealth,
  createRuntimeHealthReport,
  type RuntimeComponentHealth,
  type RuntimeHealthReport,
} from "@server/platform/runtime/runtime/models";
import { createProviderHealthChangedEvent } from "@server/platform/runtime/runtime/events";
import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type { ConfigurationProvider } from "@server/infrastructure/configuration";
import type { SupabaseHealthCheck } from "@server/infrastructure/supabase/health";
import type { StorageHealthCheck } from "@server/infrastructure/storage/health";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import {
  ProviderIds,
  ProviderRegistry,
  type ProviderHealth,
} from "@server/platform/integration/integration";

const HEALTH_COMPONENTS = Object.freeze({
  Database: "database",
  PaymentProvider: "payment-provider",
  NotificationProvider: "notification-provider",
  AIProvider: "ai-provider",
  StorageProvider: "storage-provider",
  SupportProvider: "support-provider",
  Analytics: "analytics",
});

/** Aggregates platform and provider health checks. */
export class HealthService implements IHealthService {
  constructor(private readonly provider: ServiceProvider) {}

  async check(): Promise<RuntimeHealthReport> {
    const components = await Promise.all([
      this.checkDatabase(),
      this.checkIntegrationProvider(ProviderIds.Payment, HEALTH_COMPONENTS.PaymentProvider),
      this.checkIntegrationProvider(
        ProviderIds.Notification,
        HEALTH_COMPONENTS.NotificationProvider,
      ),
      this.checkIntegrationProvider(ProviderIds.AI, HEALTH_COMPONENTS.AIProvider),
      this.checkStorageProvider(),
      this.checkSupportProvider(),
      this.checkAnalytics(),
    ]);

    return createRuntimeHealthReport({ components });
  }

  private async checkDatabase(): Promise<RuntimeComponentHealth> {
    const configuration = this.provider.resolve<ConfigurationProvider>(
      InfrastructureTokens.Configuration,
    );

    if (configuration.get("persistence") !== "supabase") {
      return createRuntimeComponentHealth({
        name: HEALTH_COMPONENTS.Database,
        status: "healthy",
        message: "In-memory persistence is active",
      });
    }

    return this.checkOptionalHealthProbe(
      HEALTH_COMPONENTS.Database,
      InfrastructureTokens.SupabaseHealthCheck,
      async (healthCheck: SupabaseHealthCheck) => healthCheck.check(),
    );
  }

  private async checkIntegrationProvider(
    providerId: string,
    componentName: string,
  ): Promise<RuntimeComponentHealth> {
    try {
      const registry = this.provider.resolve<ProviderRegistry>(
        IntegrationTokens.ProviderRegistry,
      );
      const healthResults = await registry.health(providerId);
      const health = healthResults as ProviderHealth;
      this.emitProviderHealthChanged(health);

      return createRuntimeComponentHealth({
        name: componentName,
        status: mapProviderHealthStatus(health.status),
        message: health.message,
        details: Object.freeze({ providerId: health.providerId, checkedAt: health.checkedAt }),
      });
    } catch (error) {
      return createRuntimeComponentHealth({
        name: componentName,
        status: "unhealthy",
        message: "Provider health check failed",
        details: Object.freeze({
          providerId,
          reason: error instanceof Error ? error.message : String(error),
        }),
      });
    }
  }

  private async checkStorageProvider(): Promise<RuntimeComponentHealth> {
    const integrationHealth = await this.checkIntegrationProvider(
      ProviderIds.Storage,
      HEALTH_COMPONENTS.StorageProvider,
    );

    if (integrationHealth.status !== "healthy") {
      return integrationHealth;
    }

    const storageProbe = await this.checkOptionalHealthProbe(
      HEALTH_COMPONENTS.StorageProvider,
      InfrastructureTokens.StorageHealthCheck,
      async (healthCheck: StorageHealthCheck) => healthCheck.check(),
    );

    if (storageProbe.status === "unhealthy") {
      return storageProbe;
    }

    return integrationHealth;
  }

  private checkSupportProvider(): RuntimeComponentHealth {
    return this.checkInfrastructureRegistration(
      HEALTH_COMPONENTS.SupportProvider,
      InfrastructureTokens.SupportStore,
    );
  }

  private checkAnalytics(): RuntimeComponentHealth {
    return this.checkInfrastructureRegistration(
      HEALTH_COMPONENTS.Analytics,
      InfrastructureTokens.AnalyticsStore,
    );
  }

  private checkInfrastructureRegistration(name: string, token: symbol): RuntimeComponentHealth {
    try {
      this.provider.resolve(token);
      return createRuntimeComponentHealth({
        name,
        status: "healthy",
        message: "Infrastructure adapter is available",
      });
    } catch (error) {
      return createRuntimeComponentHealth({
        name,
        status: "unhealthy",
        message: "Infrastructure adapter is unavailable",
        details: Object.freeze({
          reason: error instanceof Error ? error.message : String(error),
        }),
      });
    }
  }

  private async checkOptionalHealthProbe<T>(
    name: string,
    token: symbol,
    probe: (healthCheck: T) => Promise<{ status: string; message?: string; latencyMs?: number }>,
  ): Promise<RuntimeComponentHealth> {
    try {
      const healthCheck = this.provider.resolve<T>(token);
      const report = await probe(healthCheck);
      return createRuntimeComponentHealth({
        name,
        status: report.status === "healthy" ? "healthy" : "unhealthy",
        message: report.message,
        details: Object.freeze({ latencyMs: report.latencyMs }),
      });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Service not registered:")) {
        return createRuntimeComponentHealth({
          name,
          status: "healthy",
          message: "Adapter is not configured",
        });
      }

      return createRuntimeComponentHealth({
        name,
        status: "unhealthy",
        message: "Health probe failed",
        details: Object.freeze({
          reason: error instanceof Error ? error.message : String(error),
        }),
      });
    }
  }

  private emitProviderHealthChanged(health: ProviderHealth): void {
    createProviderHealthChangedEvent({
      providerId: health.providerId,
      status: health.status,
      message: health.message,
    });
  }
}

function mapProviderHealthStatus(
  status: ProviderHealth["status"],
): RuntimeComponentHealth["status"] {
  if (status === "healthy") {
    return "healthy";
  }
  if (status === "degraded") {
    return "degraded";
  }
  return "unhealthy";
}
