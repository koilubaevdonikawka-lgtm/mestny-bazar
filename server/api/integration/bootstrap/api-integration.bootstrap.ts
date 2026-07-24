import {
  FinikWebhookController,
  createFinikWebhookRoutes,
} from "@server/api/integration/webhooks";
import {
  IntegrationHealthController,
  createIntegrationHealthRoutes,
} from "@server/api/integration/health";
import {
  NotificationController,
  createNotificationRoutes,
} from "@server/api/integration/notifications";
import {
  PaymentController,
  createPaymentRoutes,
} from "@server/api/integration/payments";
import { createIntegrationRoutes } from "@server/api/integration/routing";
import {
  StorageController,
  createStorageRoutes,
} from "@server/api/integration/storage";
import { BootstrapTokens } from "@server/bootstrap/tokens";
import { HealthCheck } from "@server/bootstrap/health-check";
import type { OrderApplicationService } from "@server/application/services/order-application.service";
import type { ServiceProvider, ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type { FinikWebhookHandler } from "@server/infrastructure/finik/webhooks";
import type { IPaymentProvider } from "@server/infrastructure/payments";
import type { INotificationProvider } from "@server/infrastructure/notifications";
import type { IStorageProvider } from "@server/infrastructure/storage/files";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

/** Registers integration controllers and exposes route factories for ApiServer wiring. */
export function registerApiIntegration(registry: ServiceRegistry): void {
  registry.registerTransient(
    BootstrapTokens.PaymentController,
    (provider) =>
      new PaymentController(
        provider.resolve<OrderApplicationService>(InfrastructureTokens.OrderApplicationService),
        provider.resolve<IPaymentProvider>(InfrastructureTokens.PaymentProvider),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.FinikWebhookController,
    (provider) =>
      new FinikWebhookController(
        provider.resolve<FinikWebhookHandler>(InfrastructureTokens.FinikWebhookHandler),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.NotificationController,
    (provider) =>
      new NotificationController(
        provider.resolve<INotificationProvider>(InfrastructureTokens.NotificationProvider),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.StorageController,
    (provider) =>
      new StorageController(
        provider.resolve<IStorageProvider>(InfrastructureTokens.StorageProvider),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.IntegrationHealthController,
    (provider) => new IntegrationHealthController(new HealthCheck(provider)),
  );

  registry.registerSingleton(BootstrapTokens.IntegrationRoutes, (provider) =>
    createIntegrationRoutes({
      payments: provider.resolve(BootstrapTokens.PaymentController),
      webhooks: provider.resolve(BootstrapTokens.FinikWebhookController),
      notifications: provider.resolve(BootstrapTokens.NotificationController),
      storage: provider.resolve(BootstrapTokens.StorageController),
      health: provider.resolve(BootstrapTokens.IntegrationHealthController),
    }),
  );
}

/** Resolves integration routes from a configured service provider. */
export function resolveIntegrationRoutes(provider: ServiceProvider): ApiRouteDefinition[] {
  return provider.resolve(BootstrapTokens.IntegrationRoutes);
}

export {
  PaymentController,
  createPaymentRoutes,
  FinikWebhookController,
  createFinikWebhookRoutes,
  NotificationController,
  createNotificationRoutes,
  StorageController,
  createStorageRoutes,
  IntegrationHealthController,
  createIntegrationHealthRoutes,
  createIntegrationRoutes,
};
