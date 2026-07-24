import { BootstrapTokens } from "@server/bootstrap/tokens";
import type {
  CatalogApplicationService,
  OrderApplicationService,
  ProductApplicationService,
  SellerApplicationService,
} from "@server/application";
import type { IClock, IEventBus } from "@server/application/ports";
import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type { ConfigurationProvider } from "@server/infrastructure/configuration";
import type { FinikHealthCheck } from "@server/infrastructure/finik/health";
import type { SupabaseHealthCheck } from "@server/infrastructure/supabase/health";
import type { TelegramHealthCheck } from "@server/infrastructure/telegram/health";
import type { StorageHealthCheck } from "@server/infrastructure/storage/health";
import type { ILogger } from "@server/infrastructure/logging";

export type HealthStatus = "healthy" | "unhealthy";

export interface ComponentHealth {
  status: HealthStatus;
  message?: string;
  details?: Readonly<Record<string, unknown>>;
}

export interface HealthCheckReport {
  status: HealthStatus;
  timestamp: string;
  components: Readonly<Record<string, ComponentHealth>>;
}

/** Performs readiness checks across application and infrastructure layers. */
export class HealthCheck {
  constructor(private readonly provider: ServiceProvider) {}

  async check(): Promise<HealthCheckReport> {
    const components: Record<string, ComponentHealth> = {
      application: this.checkApplication(),
      infrastructure: this.checkInfrastructure(),
      repositories: this.checkRepositories(),
      eventBus: this.checkEventBus(),
      configuration: this.checkConfiguration(),
      clock: this.checkClock(),
      supabase: await this.checkSupabase(),
      finik: await this.checkFinik(),
      telegram: await this.checkTelegram(),
      storage: await this.checkStorage(),
    };

    const status = Object.values(components).every((component) => component.status === "healthy")
      ? "healthy"
      : "unhealthy";

    return Object.freeze({
      status,
      timestamp: new Date().toISOString(),
      components: Object.freeze({ ...components }),
    });
  }

  private checkApplication(): ComponentHealth {
    try {
      this.provider.resolve<ProductApplicationService>(InfrastructureTokens.ProductApplicationService);
      this.provider.resolve<SellerApplicationService>(InfrastructureTokens.SellerApplicationService);
      this.provider.resolve<CatalogApplicationService>(InfrastructureTokens.CatalogApplicationService);
      this.provider.resolve<OrderApplicationService>(InfrastructureTokens.OrderApplicationService);
      this.provider.resolve(BootstrapTokens.ApiServer);

      return Object.freeze({
        status: "healthy",
        message: "Application services are available",
      });
    } catch (error) {
      return this.down("Application services unavailable", error);
    }
  }

  private checkInfrastructure(): ComponentHealth {
    try {
      this.provider.resolve<ILogger>(InfrastructureTokens.Logger);
      this.provider.resolve(InfrastructureTokens.UnitOfWork);
      this.provider.resolve(InfrastructureTokens.TransactionManager);

      return Object.freeze({
        status: "healthy",
        message: "Infrastructure services are available",
      });
    } catch (error) {
      return this.down("Infrastructure services unavailable", error);
    }
  }

  private checkRepositories(): ComponentHealth {
    try {
      this.provider.resolve(InfrastructureTokens.ProductRepository);
      this.provider.resolve(InfrastructureTokens.SellerRepository);
      this.provider.resolve(InfrastructureTokens.CatalogRepository);
      this.provider.resolve(InfrastructureTokens.CategoryRepository);
      this.provider.resolve(InfrastructureTokens.OrderRepository);

      return Object.freeze({
        status: "healthy",
        message: "Repositories are available",
      });
    } catch (error) {
      return this.down("Repositories unavailable", error);
    }
  }

  private checkEventBus(): ComponentHealth {
    try {
      const eventBus = this.provider.resolve<IEventBus>(InfrastructureTokens.EventBus);
      const configuration = this.provider.resolve<ConfigurationProvider>(
        InfrastructureTokens.Configuration,
      );

      return Object.freeze({
        status: "healthy",
        message: "Event bus is available",
        details: Object.freeze({
          enabled: configuration.get("eventBusEnabled"),
          hasPublish: typeof eventBus.publish === "function",
        }),
      });
    } catch (error) {
      return this.down("Event bus unavailable", error);
    }
  }

  private checkConfiguration(): ComponentHealth {
    try {
      const configuration = this.provider.resolve<ConfigurationProvider>(
        InfrastructureTokens.Configuration,
      );
      const snapshot = configuration.snapshot();

      return Object.freeze({
        status: "healthy",
        message: "Configuration is available",
        details: Object.freeze({
          appName: snapshot.appName,
          defaultLocale: snapshot.defaultLocale,
          defaultCurrency: snapshot.defaultCurrency,
          paymentProvider: snapshot.paymentProvider,
          notificationProvider: snapshot.notificationProvider,
          storageProvider: snapshot.storageProvider,
        }),
      });
    } catch (error) {
      return this.down("Configuration unavailable", error);
    }
  }

  private checkClock(): ComponentHealth {
    try {
      const clock = this.provider.resolve<IClock>(InfrastructureTokens.Clock);
      const now = clock.now();

      if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
        return Object.freeze({
          status: "unhealthy",
          message: "Clock returned an invalid date",
        });
      }

      return Object.freeze({
        status: "healthy",
        message: "Clock is available",
        details: Object.freeze({ nowIso: clock.nowIso() }),
      });
    } catch (error) {
      return this.down("Clock unavailable", error);
    }
  }

  private async checkSupabase(): Promise<ComponentHealth> {
    return this.checkOptionalAdapterHealth(
      InfrastructureTokens.SupabaseHealthCheck,
      "Supabase",
      async (healthCheck: SupabaseHealthCheck) => healthCheck.check(),
    );
  }

  private async checkFinik(): Promise<ComponentHealth> {
    return this.checkOptionalAdapterHealth(
      InfrastructureTokens.FinikHealthCheck,
      "Finik",
      async (healthCheck: FinikHealthCheck) => healthCheck.check(),
    );
  }

  private async checkTelegram(): Promise<ComponentHealth> {
    return this.checkOptionalAdapterHealth(
      InfrastructureTokens.TelegramHealthCheck,
      "Telegram",
      async (healthCheck: TelegramHealthCheck) => healthCheck.check(),
    );
  }

  private async checkStorage(): Promise<ComponentHealth> {
    return this.checkOptionalAdapterHealth(
      InfrastructureTokens.StorageHealthCheck,
      "Storage",
      async (healthCheck: StorageHealthCheck) => healthCheck.check(),
    );
  }

  private async checkOptionalAdapterHealth<T>(
    token: symbol,
    name: string,
    probe: (healthCheck: T) => Promise<{ status: string; message?: string; latencyMs?: number }>,
  ): Promise<ComponentHealth> {
    try {
      const healthCheck = this.provider.resolve<T>(token);
      const report = await probe(healthCheck);

      return Object.freeze({
        status: report.status === "healthy" ? "healthy" : "unhealthy",
        message: report.message ?? `${name} health check completed`,
        details: Object.freeze({
          latencyMs: report.latencyMs,
        }),
      });
    } catch (error) {
      if (isMissingRegistrationError(error)) {
        return Object.freeze({
          status: "healthy",
          message: `${name} adapter is not configured`,
        });
      }

      return this.down(`${name} health check failed`, error);
    }
  }

  private down(message: string, error: unknown): ComponentHealth {
    return Object.freeze({
      status: "unhealthy",
      message,
      details: Object.freeze({
        reason: error instanceof Error ? error.message : String(error),
      }),
    });
  }
}

function isMissingRegistrationError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith("Service not registered:");
}
